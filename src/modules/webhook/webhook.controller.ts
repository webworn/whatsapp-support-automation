import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { 
  WhatsAppWebhookDto, 
  WebhookVerificationDto 
} from './dto/webhook.dto';

@Controller('api/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  // WhatsApp webhook verification (GET request)
  @Get('whatsapp-business')
  @Public()
  async verifyWebhook(@Query() query: WebhookVerificationDto): Promise<string> {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    this.logger.log(`Webhook verification request: mode=${mode}, token=${token}`);
    
    return this.webhookService.verifyWebhook(mode, token, challenge);
  }

  // WhatsApp webhook for incoming messages (POST request)
  @Post('whatsapp-business')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWhatsAppWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() webhookData: WhatsAppWebhookDto,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    const rawPayload = req.rawBody?.toString() || JSON.stringify(webhookData);

    this.logger.log('Received WhatsApp webhook', {
      object: webhookData.object,
      entriesCount: webhookData.entry?.length || 0,
      hasSignature: !!signature,
    });

    // Validate webhook signature (in production)
    if (signature) {
      const isValidSignature = await this.webhookService.validateSignature(rawPayload, signature);
      if (!isValidSignature) {
        this.logger.error('Invalid webhook signature');
        return { status: 'error', message: 'Invalid signature' };
      }
    }

    try {
      // Process the webhook
      const processedMessages = await this.webhookService.processWebhook(webhookData, rawPayload);

      return {
        status: 'success',
        message: 'Webhook processed successfully',
        processedMessages: processedMessages.length,
        messages: processedMessages.map(msg => ({
          id: msg.id,
          from: msg.from,
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          type: msg.messageType,
        })),
      };

    } catch (error) {
      this.logger.error('Failed to process webhook', error);
      return {
        status: 'error',
        message: 'Failed to process webhook',
        error: error.message,
      };
    }
  }

  // Get webhook logs
  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async getWebhookLogs(
    @Query('limit') limit?: string,
    @CurrentUser() user?: User,
  ) {
    try {
      const logsData = await this.webhookService.getWebhookLogs(
        user?.id,
        parseInt(limit || '50')
      );
      return {
        status: 'success',
        data: logsData,
        total: logsData.logs.length,
      };
    } catch (error) {
      this.logger.error('Failed to get webhook logs', error);
      return {
        status: 'error',
        message: 'Failed to retrieve webhook logs',
        error: error.message,
      };
    }
  }

  // Get webhook statistics
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getWebhookStats(@CurrentUser() user?: User) {
    try {
      const stats = await this.webhookService.getWebhookStats(user?.id);
      return {
        status: 'success',
        data: {
          stats,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats', error);
      return {
        status: 'error',
        message: 'Failed to retrieve webhook statistics',
        error: error.message,
      };
    }
  }

  // Webhook health check
  @Get('health')
  @Public()
  async getWebhookHealth() {
    try {
      const health = await this.webhookService.getHealthStatus();
      return {
        status: 'healthy',
        service: 'webhook',
        timestamp: new Date().toISOString(),
        ...health,
      };
    } catch (error) {
      this.logger.error('Webhook health check failed', error);
      return {
        status: 'unhealthy',
        service: 'webhook',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // Test endpoint for manual webhook testing
  @Post('whatsapp-business/test')
  @Public()
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Body() testData: any) {
    this.logger.log('Test webhook received', testData);

    // Create a sample WhatsApp webhook payload for testing
    const sampleWebhook: WhatsAppWebhookDto = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'test-entry-id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'test-phone-id',
                },
                contacts: [
                  {
                    profile: { name: testData.customerName || 'Test Customer' },
                    wa_id: testData.customerPhone || '+9876543210',
                  },
                ],
                messages: [
                  {
                    from: testData.customerPhone || '+9876543210',
                    id: `test-msg-${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: {
                      body: testData.message || 'Hello, this is a test message!',
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

    try {
      const processedMessages = await this.webhookService.processWebhook(
        sampleWebhook,
        JSON.stringify(sampleWebhook),
      );

      return {
        status: 'success',
        message: 'Test webhook processed successfully',
        processedMessages: processedMessages.length,
        testData: sampleWebhook,
        results: processedMessages,
      };

    } catch (error) {
      this.logger.error('Failed to process test webhook', error);
      return {
        status: 'error',
        message: 'Failed to process test webhook',
        error: error.message,
      };
    }
  }

}