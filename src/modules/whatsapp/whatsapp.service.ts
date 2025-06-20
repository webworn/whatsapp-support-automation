import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

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

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const accessToken = this.configService.get<string>('whatsapp.accessToken') || process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = this.configService.get<string>('whatsapp.phoneNumberId') || process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken) {
        this.logger.warn('WhatsApp access token not configured');
        return {
          messageId: 'fallback',
          status: 'failed',
          error: 'WhatsApp access token not configured'
        };
      }

      if (!phoneNumberId) {
        this.logger.warn('WhatsApp phone number ID not configured');
        return {
          messageId: 'fallback',
          status: 'failed',
          error: 'WhatsApp phone number ID not configured'
        };
      }

      // Clean phone number (remove + and ensure it's properly formatted)
      const cleanPhone = request.to.replace(/[^\d]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: {
          body: request.text
        }
      };

      this.logger.log(`Sending WhatsApp message to ${cleanPhone}`);

      const response: AxiosResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const messageId = response.data.messages?.[0]?.id || 'unknown';

      this.logger.log(`WhatsApp message sent successfully: ${messageId}`);

      return {
        messageId,
        status: 'sent'
      };

    } catch (error) {
      this.logger.error('Failed to send WhatsApp message', {
        error: error.message,
        response: error.response?.data,
        to: request.to
      });

      return {
        messageId: 'failed',
        status: 'failed',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    return this.sendMessage({ to, text, type: 'text' });
  }

  async testConnection(): Promise<{ status: string; error?: string }> {
    try {
      const accessToken = this.configService.get<string>('whatsapp.accessToken') || process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = this.configService.get<string>('whatsapp.phoneNumberId') || process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken || !phoneNumberId) {
        return {
          status: 'error',
          error: 'WhatsApp credentials not configured'
        };
      }

      // Test the API by getting phone number info
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          timeout: 5000,
        }
      );

      return {
        status: 'connected'
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}