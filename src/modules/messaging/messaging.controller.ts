import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { MessagingService, SendMessageRequest } from './messaging.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/messaging')
export class MessagingController {
  private readonly logger = new Logger(MessagingController.name);

  constructor(private readonly messagingService: MessagingService) {}

  /**
   * Send message through any supported platform
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @CurrentUser() user: User,
    @Body() sendRequest: SendMessageRequest,
  ) {
    try {
      const result = await this.messagingService.sendMessage(sendRequest);
      
      return {
        status: 'success',
        data: result,
        user: user.email,
      };
    } catch (error) {
      this.logger.error('Failed to send message', {
        error: error.message,
        user: user.email,
        platform: sendRequest.platform,
      });

      return {
        status: 'error',
        message: 'Failed to send message',
        error: error.message,
      };
    }
  }

  /**
   * Test messaging platform connections
   */
  @Get('test')
  @UseGuards(JwtAuthGuard)
  async testConnections(
    @Query('platform') platform?: string,
    @CurrentUser() user?: User,
  ) {
    try {
      const result = await this.messagingService.testConnection(platform);
      
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to test connections', error);
      
      return {
        status: 'error',
        message: 'Failed to test messaging connections',
        error: error.message,
      };
    }
  }

  /**
   * Webhook endpoint for WhatsApp BSP (not Meta)
   */
  @Post('webhook/whatsapp')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWhatsAppWebhook(
    @Req() req: Request,
    @Body() webhookData: any,
    @Headers('x-signature') signature?: string,
  ) {
    this.logger.log('Received WhatsApp BSP webhook', {
      hasSignature: !!signature,
      payloadSize: JSON.stringify(webhookData).length,
    });

    try {
      // TODO: Validate webhook signature based on BSP provider
      
      const processedMessages = await this.messagingService.processIncomingMessage(
        webhookData,
        'whatsapp'
      );

      return {
        status: 'success',
        message: 'Webhook processed successfully',
        processedMessages: processedMessages.length,
        messages: processedMessages.map(msg => ({
          id: msg.id,
          from: msg.from,
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          platform: msg.platform,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to process WhatsApp webhook', error);
      
      return {
        status: 'error',
        message: 'Failed to process webhook',
        error: error.message,
      };
    }
  }

  /**
   * Webhook endpoint for Telegram
   */
  @Post('webhook/telegram')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleTelegramWebhook(
    @Req() req: Request,
    @Body() webhookData: any,
  ) {
    this.logger.log('Received Telegram webhook', {
      updateId: webhookData.update_id,
      hasMessage: !!webhookData.message,
    });

    try {
      const processedMessages = await this.messagingService.processIncomingMessage(
        webhookData,
        'telegram'
      );

      return {
        status: 'success',
        message: 'Telegram webhook processed successfully',
        processedMessages: processedMessages.length,
      };
    } catch (error) {
      this.logger.error('Failed to process Telegram webhook', error);
      
      return {
        status: 'error',
        message: 'Failed to process webhook',
        error: error.message,
      };
    }
  }

  /**
   * Generic webhook endpoint for testing
   */
  @Post('webhook/test')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleTestWebhook(
    @Body() testData: any,
  ) {
    this.logger.log('Test webhook received', testData);

    try {
      // Create a test message
      const testMessage = {
        messageId: `test_${Date.now()}`,
        from: testData.from || '+1234567890',
        message: testData.message || 'Test message',
        platform: testData.platform || 'whatsapp',
      };

      const processedMessages = await this.messagingService.processIncomingMessage(
        testMessage,
        testMessage.platform
      );

      return {
        status: 'success',
        message: 'Test webhook processed successfully',
        testData: testMessage,
        processedMessages,
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

  /**
   * Get messaging platform status
   */
  @Get('status')
  @Public()
  async getMessagingStatus() {
    try {
      const connections = await this.messagingService.testConnection();
      
      return {
        status: 'healthy',
        service: 'messaging',
        timestamp: new Date().toISOString(),
        platforms: connections.platforms,
        overallStatus: connections.status,
      };
    } catch (error) {
      this.logger.error('Messaging status check failed', error);
      
      return {
        status: 'unhealthy',
        service: 'messaging',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}