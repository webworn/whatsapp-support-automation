import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LlmRequestDto, LlmResponseDto, ChatMessage, OpenRouterResponse } from './dto/llm-request.dto';
import { retryWithBackoff, isRetryableError } from '../../shared/utils/retry.util';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly primaryModel: string;
  private readonly fallbackModel: string;
  private readonly defaultMaxTokens: number;
  private readonly defaultTemperature: number;
  private readonly timeout: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const llmConfig = this.configService.get('llm');
    this.baseUrl = llmConfig.openrouter.baseUrl;
    this.apiKey = llmConfig.openrouter.apiKey;
    this.primaryModel = llmConfig.openrouter.primaryModel;
    this.fallbackModel = llmConfig.openrouter.fallbackModel;
    this.defaultMaxTokens = llmConfig.openrouter.maxTokens;
    this.defaultTemperature = llmConfig.openrouter.temperature;
    this.timeout = llmConfig.openrouter.timeout;
  }

  async generateResponse(request: LlmRequestDto): Promise<LlmResponseDto> {
    const startTime = Date.now();
    const modelToUse = request.model || this.primaryModel;

    try {
      // Try primary model first
      const response = await this.callOpenRouter(request, modelToUse);
      return {
        ...response,
        processingTime: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      this.logger.warn(`Primary model ${modelToUse} failed: ${error.message}`);
      
      // Try fallback model if primary fails
      if (modelToUse !== this.fallbackModel) {
        try {
          const response = await this.callOpenRouter(request, this.fallbackModel);
          return {
            ...response,
            modelUsed: `${this.fallbackModel} (fallback)`,
            processingTime: Date.now() - startTime,
            success: true,
          };
        } catch (fallbackError) {
          this.logger.error(`Fallback model also failed: ${fallbackError.message}`);
        }
      }

      // Return error response
      return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        modelUsed: 'error_fallback',
        cost: 0,
        tokensUsed: 0,
        processingTime: Date.now() - startTime,
        success: false,
        error: error.message,
      };
    }
  }

  private async callOpenRouter(request: LlmRequestDto, model: string): Promise<Omit<LlmResponseDto, 'processingTime' | 'success'>> {
    const messages = this.buildMessages(request);
    
    const payload = {
      model,
      messages,
      max_tokens: request.maxTokens || this.defaultMaxTokens,
      temperature: request.temperature || this.defaultTemperature,
      top_p: this.configService.get('llm.openrouter.topP', 1),
      frequency_penalty: this.configService.get('llm.openrouter.frequencyPenalty', 0),
      presence_penalty: this.configService.get('llm.openrouter.presencePenalty', 0),
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.configService.get('APP_URL', 'https://localhost:3000'),
      'X-Title': 'WhatsApp Support Automation',
    };

    const response = await retryWithBackoff(
      async () => {
        const result = await firstValueFrom(
          this.httpService.post<OpenRouterResponse>(
            `${this.baseUrl}/chat/completions`,
            payload,
            { 
              headers,
              timeout: this.timeout,
            }
          )
        );
        return result.data;
      },
      {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        retryIf: isRetryableError,
      }
    );

    // Extract response content
    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Invalid response format from OpenRouter');
    }

    // Calculate cost
    const cost = this.calculateCost(model, response.usage.total_tokens);

    return {
      response: responseContent.trim(),
      modelUsed: model,
      cost,
      tokensUsed: response.usage.total_tokens,
    };
  }

  private buildMessages(request: LlmRequestDto): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // System prompt
    const systemPrompt = this.buildSystemPrompt(request.context || {});
    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // Add conversation history if available
    const recentMessages = request.context?.recentMessages || [];
    for (const historyMessage of recentMessages.slice(-10)) { // Last 10 messages
      messages.push({
        role: historyMessage.direction === 'outbound' ? 'assistant' : 'user',
        content: historyMessage.content,
      });
    }

    // Current user message
    messages.push({
      role: 'user',
      content: request.message,
    });

    return messages;
  }

  private buildSystemPrompt(context: Record<string, any>): string {
    let prompt = `You are a helpful WhatsApp customer support assistant for an enterprise business.

Guidelines:
- Be concise and friendly
- Keep responses under 300 characters when possible for WhatsApp
- Use simple, clear language
- If you cannot help with something, politely offer to escalate to a human agent
- Use emojis sparingly and appropriately
- Always be professional and helpful
- Respond in the user's preferred language when possible

Current conversation context:`;

    if (context.userName) {
      prompt += `\n- Customer name: ${context.userName}`;
    }

    if (context.language) {
      prompt += `\n- Preferred language: ${context.language}`;
    }

    if (context.currentFlow) {
      prompt += `\n- Current topic: ${context.currentFlow}`;
    }

    if (context.userType) {
      prompt += `\n- Customer type: ${context.userType}`;
    }

    if (context.previousIssues) {
      prompt += `\n- Previous issues: ${context.previousIssues}`;
    }

    return prompt;
  }

  private calculateCost(model: string, totalTokens: number): number {
    // Cost per 1K tokens (update these based on actual OpenRouter pricing)
    const costPer1K: Record<string, number> = {
      'anthropic/claude-3-sonnet': 0.003,
      'anthropic/claude-3-haiku': 0.00025,
      'openai/gpt-4': 0.03,
      'openai/gpt-3.5-turbo': 0.002,
      'mistralai/mixtral-8x7b-instruct': 0.0007,
      'google/palm-2-chat-bison': 0.0005,
    };

    const rate = costPer1K[model] || 0.002; // Default rate
    return (totalTokens / 1000) * rate;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const testRequest: LlmRequestDto = {
        message: 'Hello',
        context: {},
      };

      const response = await this.generateResponse(testRequest);
      return response.success;
    } catch (error) {
      this.logger.error('OpenRouter connection validation failed', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      this.primaryModel,
      this.fallbackModel,
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'mistralai/mixtral-8x7b-instruct',
    ];
  }

  async getModelInfo(model: string): Promise<any> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
      };

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/models/${model}`, { headers })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get model info for ${model}`, error);
      return null;
    }
  }
}