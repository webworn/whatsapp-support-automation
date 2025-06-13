import {
  Controller,
  Post,
  Body,
  Headers,
  Request,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WebhookService } from './webhook.service';
import { QueueService } from '../../shared/queue/queue.service';
import {
  WebhookPayloadDto,
  WebhookResponseDto,
  WebhookStatsDto,
  RawWebhookData,
  WebhookSource,
  WhatsAppBusinessWebhookDto,
} from './dto/webhook.dto';
import { validateWebhookSignature } from '../../shared/utils/validation.util';
import * as crypto from 'crypto';

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

  @Get('whatsapp-business')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'WhatsApp Business webhook verification endpoint' })
  @ApiQuery({
    name: 'hub.mode',
    description: 'Webhook verification mode',
    required: false,
  })
  @ApiQuery({
    name: 'hub.verify_token',
    description: 'Webhook verification token',
    required: false,
  })
  @ApiQuery({
    name: 'hub.challenge',
    description: 'Webhook verification challenge',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook verification successful',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid verification token',
  })
  async verifyWhatsAppBusinessWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    this.logger.log('WhatsApp Business webhook verification request', {
      mode,
      hasToken: !!verifyToken,
      hasChallenge: !!challenge,
    });

    if (mode === 'subscribe' && verifyToken) {
      const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
      
      if (!expectedToken) {
        this.logger.error('WHATSAPP_VERIFY_TOKEN not configured');
        throw new BadRequestException('Webhook verification not configured');
      }

      if (verifyToken === expectedToken) {
        this.logger.log('WhatsApp Business webhook verification successful');
        return challenge;
      } else {
        this.logger.warn('Invalid WhatsApp Business verification token');
        throw new UnauthorizedException('Invalid verification token');
      }
    }

    throw new BadRequestException('Invalid verification request');
  }

  @Post('whatsapp-business')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'WhatsApp Business webhook endpoint' })
  @ApiHeader({
    name: 'X-Hub-Signature-256',
    description: 'WhatsApp Business webhook signature for verification',
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
  @Throttle({ default: { limit: 200, ttl: 60000 } }) // 200 requests per minute for WhatsApp Business
  async handleWhatsAppBusinessWebhook(
    @Body() payload: WhatsAppBusinessWebhookDto,
    @Headers() headers: Record<string, string>,
    @Request() req: any,
  ): Promise<WebhookResponseDto> {
    const startTime = Date.now();
    const signature = headers['x-hub-signature-256'] || headers['X-Hub-Signature-256'];

    this.logger.log('Received WhatsApp Business webhook', {
      payloadSize: JSON.stringify(payload).length,
      hasSignature: !!signature,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      entriesCount: payload.entry?.length || 0,
    });

    try {
      // Validate webhook signature
      if (!this.validateWhatsAppBusinessSignature(payload, signature)) {
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
          source: WebhookSource.WHATSAPP_BUSINESS,
          receivedAt: rawData.receivedAt,
        },
        5, // High priority for incoming messages
      );

      // Log webhook for debugging
      await this.webhookService.logWebhook(WebhookSource.WHATSAPP_BUSINESS, rawData, true);

      const processingTime = Date.now() - startTime;

      this.logger.log('WhatsApp Business webhook queued successfully', {
        processingTime,
        entriesProcessed: payload.entry?.length || 0,
      });

      return {
        success: true,
        message: 'Webhook received and queued for processing',
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Failed to process WhatsApp Business webhook', {
        error: error.message,
        processingTime,
        payloadPreview: JSON.stringify(payload).substring(0, 200),
      });

      // Log failed webhook
      await this.webhookService.logWebhook(
        WebhookSource.WHATSAPP_BUSINESS,
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

  private validateWhatsAppBusinessSignature(payload: any, signature: string): boolean {
    if (!signature) {
      this.logger.warn('Missing WhatsApp Business webhook signature');
      return false;
    }

    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
      this.logger.warn('WHATSAPP_APP_SECRET not configured');
      return false;
    }

    try {
      const payloadString = JSON.stringify(payload);
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payloadString)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        this.logger.warn('Invalid WhatsApp Business webhook signature', {
          expected: expectedSignature.substring(0, 20) + '...',
          received: signature.substring(0, 20) + '...',
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error validating WhatsApp Business webhook signature', error);
      return false;
    }
  }

  @Post('test-whatsapp-business')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test WhatsApp Business webhook with sample data' })
  @ApiResponse({
    status: 200,
    description: 'Test webhook processed',
    type: WebhookResponseDto,
  })
  async testWhatsAppBusinessWebhook(
    @Body() testData?: {
      phoneNumber?: string;
      message?: string;
      messageType?: string;
    },
  ): Promise<WebhookResponseDto> {
    const startTime = Date.now();

    // Create sample WhatsApp Business webhook payload
    const samplePayload: WhatsAppBusinessWebhookDto = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                contacts: [
                  {
                    profile: {
                      name: testData?.phoneNumber ? 'Test User' : 'Sample User',
                    },
                    wa_id: testData?.phoneNumber || '1234567890',
                  },
                ],
                messages: [
                  {
                    id: `test_msg_${Date.now()}`,
                    from: testData?.phoneNumber || '1234567890',
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: testData?.messageType || 'text',
                    text: {
                      body: testData?.message || 'Hello! This is a test message for WhatsApp Business webhook.',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    this.logger.log('Testing WhatsApp Business webhook', {
      phoneNumber: testData?.phoneNumber || '1234567890',
      messageType: testData?.messageType || 'text',
    });

    try {
      // Prepare raw webhook data
      const rawData: RawWebhookData = {
        headers: { 'content-type': 'application/json' },
        body: samplePayload,
        query: {},
        ip: '127.0.0.1',
        userAgent: 'WhatsApp-Business-Test',
        receivedAt: new Date(),
      };

      // Process test webhook directly (bypass signature validation)
      const result = await this.webhookService.processWhatsAppBusinessWebhook(samplePayload, rawData);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: 'WhatsApp Business test webhook processed successfully',
        webhookId: result.webhookId,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Failed to process WhatsApp Business test webhook', {
        error: error.message,
        testData,
      });

      return {
        success: false,
        message: 'Failed to process WhatsApp Business test webhook',
        processingTime,
        error: error.message,
      };
    }
  }

  @Post('simulate-whatsapp-business')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate various WhatsApp Business webhook scenarios' })
  @ApiResponse({
    status: 200,
    description: 'Simulation completed',
  })
  async simulateWhatsAppBusinessWebhook(
    @Body() simulationData: {
      scenario: 'text_message' | 'button_reply' | 'list_reply' | 'image_message' | 'status_update';
      phoneNumber?: string;
      message?: string;
    },
  ): Promise<WebhookResponseDto> {
    const startTime = Date.now();

    let samplePayload: WhatsAppBusinessWebhookDto;

    switch (simulationData.scenario) {
      case 'text_message':
        samplePayload = this.createTextMessagePayload(
          simulationData.phoneNumber || '1234567890',
          simulationData.message || 'Hello! I need help with my order.',
        );
        break;

      case 'button_reply':
        samplePayload = this.createButtonReplyPayload(
          simulationData.phoneNumber || '1234567890',
          'tech_support',
          'Technical Support',
        );
        break;

      case 'list_reply':
        samplePayload = this.createListReplyPayload(
          simulationData.phoneNumber || '1234567890',
          'billing_inquiry',
          'Billing Inquiry',
        );
        break;

      case 'image_message':
        samplePayload = this.createImageMessagePayload(
          simulationData.phoneNumber || '1234567890',
          'Screenshot of the error I\'m experiencing',
        );
        break;

      case 'status_update':
        samplePayload = this.createStatusUpdatePayload('test_msg_123', 'delivered');
        break;

      default:
        throw new BadRequestException('Invalid simulation scenario');
    }

    try {
      const rawData: RawWebhookData = {
        headers: { 'content-type': 'application/json' },
        body: samplePayload,
        query: {},
        ip: '127.0.0.1',
        userAgent: 'WhatsApp-Business-Simulation',
        receivedAt: new Date(),
      };

      const result = await this.webhookService.processWhatsAppBusinessWebhook(samplePayload, rawData);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: `WhatsApp Business ${simulationData.scenario} simulation completed`,
        webhookId: result.webhookId,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Failed to process WhatsApp Business simulation', {
        error: error.message,
        scenario: simulationData.scenario,
      });

      return {
        success: false,
        message: 'Failed to process WhatsApp Business simulation',
        processingTime,
        error: error.message,
      };
    }
  }

  private createTextMessagePayload(phoneNumber: string, message: string): WhatsAppBusinessWebhookDto {
    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                contacts: [
                  {
                    profile: { name: 'Test User' },
                    wa_id: phoneNumber,
                  },
                ],
                messages: [
                  {
                    id: `test_msg_${Date.now()}`,
                    from: phoneNumber,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: { body: message },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };
  }

  private createButtonReplyPayload(phoneNumber: string, buttonId: string, buttonTitle: string): WhatsAppBusinessWebhookDto {
    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                contacts: [
                  {
                    profile: { name: 'Test User' },
                    wa_id: phoneNumber,
                  },
                ],
                messages: [
                  {
                    id: `test_msg_${Date.now()}`,
                    from: phoneNumber,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'interactive',
                    interactive: {
                      type: 'button_reply',
                      button_reply: {
                        id: buttonId,
                        title: buttonTitle,
                      },
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };
  }

  private createListReplyPayload(phoneNumber: string, listId: string, listTitle: string): WhatsAppBusinessWebhookDto {
    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                contacts: [
                  {
                    profile: { name: 'Test User' },
                    wa_id: phoneNumber,
                  },
                ],
                messages: [
                  {
                    id: `test_msg_${Date.now()}`,
                    from: phoneNumber,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'interactive',
                    interactive: {
                      type: 'list_reply',
                      list_reply: {
                        id: listId,
                        title: listTitle,
                        description: 'Selected from list menu',
                      },
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };
  }

  private createImageMessagePayload(phoneNumber: string, caption: string): WhatsAppBusinessWebhookDto {
    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                contacts: [
                  {
                    profile: { name: 'Test User' },
                    wa_id: phoneNumber,
                  },
                ],
                messages: [
                  {
                    id: `test_msg_${Date.now()}`,
                    from: phoneNumber,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'image',
                    image: {
                      caption,
                      mime_type: 'image/jpeg',
                      sha256: 'test_sha256_hash',
                      id: 'test_image_id',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };
  }

  private createStatusUpdatePayload(messageId: string, status: string): WhatsAppBusinessWebhookDto {
    return {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test_business_account_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test_phone_number_id',
                },
                statuses: [
                  {
                    id: messageId,
                    status,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    recipient_id: '1234567890',
                  },
                ],
              },
              field: 'message_status',
            },
          ],
        },
      ],
    };
  }
}