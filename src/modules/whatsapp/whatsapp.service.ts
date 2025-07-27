import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from '../messaging/messaging.service';

export interface SendMessageRequest {
  to: string;
  text: string;
  type?: 'text' | 'template';
}

export interface SendMessageResponse {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      this.logger.log(`Sending WhatsApp message via messaging service to ${request.to}`);

      // Use the new messaging service instead of Meta's API
      const result = await this.messagingService.sendMessage({
        to: request.to,
        text: request.text,
        type: request.type || 'text',
        platform: 'whatsapp'
      });

      return {
        messageId: result.messageId,
        status: result.status === 'sent' ? 'sent' : 'failed',
        error: result.error
      };

    } catch (error) {
      this.logger.error('Failed to send WhatsApp message', {
        error: error.message,
        to: request.to
      });

      return {
        messageId: 'failed',
        status: 'failed',
        error: error.message
      };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    return this.sendMessage({ to, text, type: 'text' });
  }

  async testConnection(): Promise<{ status: string; error?: string }> {
    try {
      this.logger.log('Testing WhatsApp connection via messaging service');

      // Test connection through the messaging service
      const result = await this.messagingService.testConnection('whatsapp');

      if (result.platforms?.whatsapp?.status === 'connected') {
        return {
          status: 'connected'
        };
      } else {
        return {
          status: 'error',
          error: result.platforms?.whatsapp?.error || 'Connection test failed'
        };
      }

    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}