import {
  Controller,
  Post,
  Body,
  Headers,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WebhookService } from './webhook.service';
import { QueueService } from '../../shared/queue/queue.service';
import {
  WebhookPayloadDto,
  WebhookResponseDto,
  WebhookStatsDto,
  RawWebhookData,
  WebhookSource,
} from './dto/webhook.dto';
import { validateWebhookSignature } from '../../shared/utils/validation.util';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly queueService: QueueService,
  ) {}

  @Post('msg91')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MSG91 WhatsApp webhook endpoint' })
  @ApiHeader({
    name: 'X-MSG91-Signature',
    description: 'MSG91 webhook signature for verification',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook payload',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid webhook signature',
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  async handleMsg91Webhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Request() req: any,
  ): Promise<WebhookResponseDto> {
    const startTime = Date.now();
    const signature = headers['x-msg91-signature'] || headers['X-MSG91-Signature'];

    this.logger.log('Received MSG91 webhook', {
      payloadSize: JSON.stringify(payload).length,
      hasSignature: !!signature,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    try {
      // Validate webhook signature
      if (!this.validateMsg91Signature(payload, signature)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Prepare raw webhook data
      const rawData: RawWebhookData = {
        headers,
        body: payload,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        receivedAt: new Date(),
      };

      // Add to queue for async processing
      await this.queueService.addWebhookJob(
        {
          payload,
          signature: signature || '',
          source: WebhookSource.MSG91,
          receivedAt: rawData.receivedAt,
        },
        5, // High priority for incoming messages
      );

      // Log webhook for debugging
      await this.webhookService.logWebhook(WebhookSource.MSG91, rawData, true);

      const processingTime = Date.now() - startTime;

      this.logger.log('MSG91 webhook queued successfully', {
        processingTime,
        payloadType: payload.type,
      });

      return {
        success: true,
        message: 'Webhook received and queued for processing',
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Failed to process MSG91 webhook', {
        error: error.message,
        processingTime,
        payloadPreview: JSON.stringify(payload).substring(0, 200),
      });

      // Log failed webhook
      await this.webhookService.logWebhook(
        WebhookSource.MSG91,
        {
          headers,
          body: payload,
          query: req.query,
          ip: req.ip,
          userAgent: req.get('User-Agent') || '',
          receivedAt: new Date(),
        },
        false,
        error.message,
      );

      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        message: 'Failed to process webhook',
        processingTime,
        error: error.message,
      };
    }
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test webhook endpoint for development' })
  @ApiResponse({
    status: 200,
    description: 'Test webhook processed',
    type: WebhookResponseDto,
  })
  async handleTestWebhook(
    @Body() payload: WebhookPayloadDto,
    @Headers() headers: Record<string, string>,
    @Request() req: any,
  ): Promise<WebhookResponseDto> {
    const startTime = Date.now();

    this.logger.log('Received test webhook', {
      type: payload.type,
      hasData: !!payload.data,
    });

    try {
      // Prepare raw webhook data
      const rawData: RawWebhookData = {
        headers,
        body: payload,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        receivedAt: new Date(),
      };

      // Process test webhook synchronously
      const result = await this.webhookService.processTestWebhook(payload, rawData);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: 'Test webhook processed successfully',
        webhookId: result.webhookId,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Failed to process test webhook', {
        error: error.message,
        type: payload.type,
      });

      return {
        success: false,
        message: 'Failed to process test webhook',
        processingTime,
        error: error.message,
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get webhook processing statistics' })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics',
    type: WebhookStatsDto,
  })
  async getWebhookStats(): Promise<WebhookStatsDto> {
    try {
      return await this.webhookService.getWebhookStats();
    } catch (error) {
      this.logger.error('Failed to get webhook stats', error);
      throw error;
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Webhook service health check' })
  @ApiResponse({
    status: 200,
    description: 'Webhook service health status',
  })
  async getWebhookHealth(): Promise<{
    status: string;
    queueStats: any;
    recentActivity: any;
  }> {
    try {
      const [queueStats, recentActivity] = await Promise.all([
        this.queueService.getWebhookQueueStats(),
        this.webhookService.getRecentActivity(),
      ]);

      return {
        status: 'healthy',
        queueStats,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Webhook health check failed', error);
      return {
        status: 'unhealthy',
        queueStats: null,
        recentActivity: null,
      };
    }
  }

  private validateMsg91Signature(payload: any, signature: string): boolean {
    if (!signature) {
      this.logger.warn('Missing MSG91 webhook signature');
      return false;
    }

    const webhookSecret = process.env.MSG91_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.warn('MSG91 webhook secret not configured');
      return false;
    }

    try {
      const payloadString = JSON.stringify(payload);
      return validateWebhookSignature(payloadString, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Error validating MSG91 webhook signature', error);
      return false;
    }
  }
}