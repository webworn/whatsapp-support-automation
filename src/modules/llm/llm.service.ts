import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/database/prisma.service';
import { OpenRouterService } from './openrouter.service';
import { LlmRequestDto, LlmResponseDto, BatchLlmRequestDto, BatchLlmResponseDto } from './dto/llm-request.dto';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly costTrackingEnabled: boolean;
  private readonly dailyBudget: number;
  private readonly monthlyBudget: number;

  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const llmConfig = this.configService.get('llm');
    this.costTrackingEnabled = llmConfig.cost.trackingEnabled;
    this.dailyBudget = llmConfig.cost.budget.daily;
    this.monthlyBudget = llmConfig.cost.budget.monthly;
  }

  async generateResponse(request: LlmRequestDto): Promise<LlmResponseDto> {
    const startTime = Date.now();

    try {
      // Check budget if cost tracking is enabled
      if (this.costTrackingEnabled && request.phoneNumber) {
        const canProceed = await this.checkBudgetLimits(request.phoneNumber);
        if (!canProceed) {
          return {
            response: 'I apologize, but the service is temporarily unavailable due to usage limits. Please try again later or contact support.',
            modelUsed: 'budget_limit',
            cost: 0,
            tokensUsed: 0,
            processingTime: Date.now() - startTime,
            success: false,
            error: 'Daily or monthly budget limit exceeded',
          };
        }
      }

      // Generate response using OpenRouter
      const response = await this.openRouterService.generateResponse(request);

      // Track usage if enabled
      if (this.costTrackingEnabled && request.phoneNumber) {
        await this.trackUsage(request.phoneNumber, response);
      }

      // Emit event for analytics
      this.eventEmitter.emit('llm.response.generated', {
        phoneNumber: request.phoneNumber,
        model: response.modelUsed,
        cost: response.cost,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
        success: response.success,
      });

      this.logger.log(`Generated response for ${request.phoneNumber}`, {
        model: response.modelUsed,
        cost: response.cost,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to generate LLM response', {
        error: error.message,
        phoneNumber: request.phoneNumber,
        model: request.model,
      });

      // Track failed request
      if (this.costTrackingEnabled && request.phoneNumber) {
        await this.trackUsage(request.phoneNumber, {
          response: '',
          modelUsed: request.model || 'unknown',
          cost: 0,
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          success: false,
          error: error.message,
        });
      }

      throw error;
    }
  }

  async generateBatchResponses(batchRequest: BatchLlmRequestDto): Promise<BatchLlmResponseDto> {
    const startTime = Date.now();
    const responses: LlmResponseDto[] = [];
    let totalCost = 0;
    let successCount = 0;
    let failureCount = 0;

    try {
      if (batchRequest.parallel) {
        // Process requests in parallel
        const promises = batchRequest.requests.map(request => 
          this.generateResponse(request).catch(error => ({
            response: 'Failed to process request',
            modelUsed: 'error',
            cost: 0,
            tokensUsed: 0,
            processingTime: 0,
            success: false,
            error: error.message,
          }))
        );

        const results = await Promise.all(promises);
        responses.push(...results);
      } else {
        // Process requests sequentially
        for (const request of batchRequest.requests) {
          try {
            const response = await this.generateResponse(request);
            responses.push(response);
          } catch (error) {
            responses.push({
              response: 'Failed to process request',
              modelUsed: 'error',
              cost: 0,
              tokensUsed: 0,
              processingTime: 0,
              success: false,
              error: error.message,
            });
          }
        }
      }

      // Calculate totals
      for (const response of responses) {
        totalCost += response.cost;
        if (response.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      const result: BatchLlmResponseDto = {
        responses,
        totalCost,
        totalProcessingTime: Date.now() - startTime,
        successCount,
        failureCount,
      };

      this.logger.log(`Processed batch of ${batchRequest.requests.length} requests`, {
        totalCost,
        successCount,
        failureCount,
        processingTime: result.totalProcessingTime,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to process batch LLM requests', error);
      throw error;
    }
  }

  async checkBudgetLimits(phoneNumber: string): Promise<boolean> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Check daily usage
      const dailyUsage = await this.prismaService.llmUsage.aggregate({
        where: {
          phoneNumber,
          createdAt: {
            gte: startOfDay,
          },
        },
        _sum: {
          cost: true,
        },
      });

      const dailyCost = dailyUsage._sum.cost || 0;
      if (dailyCost >= this.dailyBudget) {
        this.logger.warn(`Daily budget exceeded for ${phoneNumber}`, {
          dailyCost,
          dailyBudget: this.dailyBudget,
        });
        return false;
      }

      // Check monthly usage
      const monthlyUsage = await this.prismaService.llmUsage.aggregate({
        where: {
          phoneNumber,
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          cost: true,
        },
      });

      const monthlyCost = monthlyUsage._sum.cost || 0;
      if (monthlyCost >= this.monthlyBudget) {
        this.logger.warn(`Monthly budget exceeded for ${phoneNumber}`, {
          monthlyCost,
          monthlyBudget: this.monthlyBudget,
        });
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to check budget limits for ${phoneNumber}`, error);
      // Allow request to proceed if budget check fails
      return true;
    }
  }

  private async trackUsage(phoneNumber: string, response: LlmResponseDto): Promise<void> {
    try {
      await this.prismaService.llmUsage.create({
        data: {
          phoneNumber,
          model: response.modelUsed,
          promptTokens: 0, // OpenRouter doesn't always provide breakdown
          outputTokens: 0,
          totalTokens: response.tokensUsed,
          cost: response.cost,
          requestTime: response.processingTime,
          success: response.success,
          errorMessage: response.error,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to track LLM usage for ${phoneNumber}`, error);
    }
  }

  async getUsageStats(phoneNumber: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usage = await this.prismaService.llmUsage.findMany({
        where: {
          phoneNumber,
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const stats = {
        totalRequests: usage.length,
        successfulRequests: usage.filter(u => u.success).length,
        failedRequests: usage.filter(u => !u.success).length,
        totalCost: usage.reduce((sum, u) => sum + u.cost, 0),
        totalTokens: usage.reduce((sum, u) => sum + u.totalTokens, 0),
        averageRequestTime: usage.length > 0 
          ? usage.reduce((sum, u) => sum + u.requestTime, 0) / usage.length 
          : 0,
        modelUsage: this.aggregateByModel(usage),
        dailyUsage: this.aggregateByDay(usage),
      };

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get usage stats for ${phoneNumber}`, error);
      return null;
    }
  }

  private aggregateByModel(usage: any[]): Record<string, any> {
    const models: Record<string, any> = {};

    for (const record of usage) {
      if (!models[record.model]) {
        models[record.model] = {
          requests: 0,
          cost: 0,
          tokens: 0,
        };
      }

      models[record.model].requests++;
      models[record.model].cost += record.cost;
      models[record.model].tokens += record.totalTokens;
    }

    return models;
  }

  private aggregateByDay(usage: any[]): Record<string, any> {
    const days: Record<string, any> = {};

    for (const record of usage) {
      const day = record.createdAt.toISOString().split('T')[0];
      
      if (!days[day]) {
        days[day] = {
          requests: 0,
          cost: 0,
          tokens: 0,
        };
      }

      days[day].requests++;
      days[day].cost += record.cost;
      days[day].tokens += record.totalTokens;
    }

    return days;
  }

  async validateService(): Promise<boolean> {
    return await this.openRouterService.validateConnection();
  }

  getAvailableModels(): string[] {
    return this.openRouterService.getAvailableModels();
  }
}