import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SendMessageDto,
  DeliveryResponseDto,
  BulkMessageDto,
  BulkDeliveryResponseDto,
  MSG91ApiResponse,
  MSG91BulkResponse,
  MessageType,
  QuickReplyDto,
  ButtonDto,
  MediaDto,
} from './dto/delivery.dto';
import { retryWithBackoff, isRetryableError } from '../../shared/utils/retry.util';
import { normalizePhoneNumber } from '../../shared/utils/validation.util';

@Injectable()
export class MSG91Service {
  private readonly logger = new Logger(MSG91Service.name);
  private readonly baseUrl: string;
  private readonly authKey: string;
  private readonly senderId: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const whatsappConfig = this.configService.get('whatsapp');
    this.baseUrl = whatsappConfig.msg91.baseUrl;
    this.authKey = whatsappConfig.msg91.authKey;
    this.senderId = whatsappConfig.msg91.senderId;
    this.timeout = whatsappConfig.msg91.timeout;
    this.maxRetries = whatsappConfig.msg91.retries;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<DeliveryResponseDto> {
    const { phoneNumber, message, messageType = MessageType.TEXT, quickReplies, buttons, media } = sendMessageDto;

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      this.logger.log(`Sending ${messageType} message to ${normalizedPhone}`, {
        messageLength: message.length,
        hasQuickReplies: !!quickReplies?.length,
        hasButtons: !!buttons?.length,
        hasMedia: !!media,
      });

      // Prepare MSG91 payload based on message type
      const payload = this.buildMsg91Payload(
        normalizedPhone,
        message,
        messageType,
        quickReplies,
        buttons,
        media,
      );

      // Send message with retry logic
      const response = await retryWithBackoff(
        () => this.callMsg91Api('/whatsapp/send', payload),
        {
          attempts: this.maxRetries,
          delay: 1000,
          backoff: 'exponential',
          retryIf: isRetryableError,
        },
      );

      const result = this.parseMsg91Response(response);

      this.logger.log(`Message sent successfully to ${normalizedPhone}`, {
        messageId: result.messageId,
        status: result.status,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to ${phoneNumber}`, {
        error: error.message,
        phoneNumber,
        messageType,
      });

      return {
        success: false,
        status: 'failed',
        message: 'Failed to send message',
        error: error.message,
      };
    }
  }

  async sendBulkMessages(bulkMessageDto: BulkMessageDto): Promise<BulkDeliveryResponseDto> {
    const {
      phoneNumbers,
      message,
      messageType = MessageType.TEXT,
      batchSize = 100,
      batchDelay = 1000,
    } = bulkMessageDto;

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;
    const results: DeliveryResponseDto[] = [];
    const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Starting bulk message send`, {
      batchId,
      totalRecipients: phoneNumbers.length,
      batchSize,
      messageType,
    });

    try {
      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);
        
        this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1}`, {
          batchId,
          batchSize: batch.length,
          progress: `${i + batch.length}/${phoneNumbers.length}`,
        });

        // Send batch
        const batchResults = await this.sendMessageBatch(batch, message, messageType);
        results.push(...batchResults);

        // Count successes and failures
        for (const result of batchResults) {
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        }

        // Add delay between batches (except for the last batch)
        if (i + batchSize < phoneNumbers.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }

      const processingTime = Date.now() - startTime;
      const estimatedCompletionTime = new Date(Date.now() + (successCount * 2000)); // Estimate 2s per message

      this.logger.log(`Bulk message send completed`, {
        batchId,
        successCount,
        failureCount,
        processingTime,
      });

      return {
        totalMessages: phoneNumbers.length,
        successCount,
        failureCount,
        batchId,
        results,
        estimatedCompletionTime,
        totalCost: this.estimateBulkCost(successCount, messageType),
      };
    } catch (error) {
      this.logger.error(`Bulk message send failed`, {
        batchId,
        error: error.message,
        successCount,
        failureCount,
      });

      throw error;
    }
  }

  private async sendMessageBatch(
    phoneNumbers: string[],
    message: string,
    messageType: MessageType,
  ): Promise<DeliveryResponseDto[]> {
    const results: DeliveryResponseDto[] = [];

    // Use MSG91 bulk API if available, otherwise send individually
    try {
      // For now, send individually (can be optimized with bulk API)
      const promises = phoneNumbers.map(phoneNumber =>
        this.sendMessage({
          phoneNumber,
          message,
          messageType,
        }).catch(error => ({
          success: false,
          status: 'failed',
          message: 'Failed to send message',
          error: error.message,
        }))
      );

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    } catch (error) {
      // If batch fails, mark all as failed
      for (const phoneNumber of phoneNumbers) {
        results.push({
          success: false,
          status: 'failed',
          message: 'Batch send failed',
          error: error.message,
        });
      }
    }

    return results;
  }

  private buildMsg91Payload(
    phoneNumber: string,
    message: string,
    messageType: MessageType,
    quickReplies?: QuickReplyDto[],
    buttons?: ButtonDto[],
    media?: MediaDto,
  ): any {
    const basePayload = {
      to: phoneNumber,
      type: messageType,
      message: message,
      sender: this.senderId,
    };

    // Add quick replies if provided
    if (quickReplies && quickReplies.length > 0) {
      basePayload['quick_reply'] = {
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: quickReplies.map((reply, index) => ({
            type: 'reply',
            reply: {
              id: reply.id || `qr_${index}`,
              title: reply.text,
            },
          })),
        },
      };
    }

    // Add buttons if provided
    if (buttons && buttons.length > 0) {
      basePayload['interactive'] = {
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: buttons.map((button, index) => ({
            type: button.type || 'reply',
            reply: {
              id: `btn_${index}`,
              title: button.text,
            },
          })),
        },
      };
    }

    // Add media if provided
    if (media) {
      basePayload['media'] = {
        type: messageType,
        url: media.url,
        caption: media.caption,
        filename: media.filename,
      };
    }

    return basePayload;
  }

  private async callMsg91Api(endpoint: string, payload: any): Promise<MSG91ApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'authkey': this.authKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    this.logger.debug(`Calling MSG91 API: ${endpoint}`, {
      url,
      payloadSize: JSON.stringify(payload).length,
    });

    const response = await firstValueFrom(
      this.httpService.post<MSG91ApiResponse>(url, payload, {
        headers,
        timeout: this.timeout,
      })
    );

    if (response.status !== 200) {
      throw new Error(`MSG91 API error: ${response.status} - ${response.statusText}`);
    }

    return response.data;
  }

  private parseMsg91Response(response: MSG91ApiResponse): DeliveryResponseDto {
    if (response.error) {
      return {
        success: false,
        status: 'failed',
        message: response.message || 'MSG91 API error',
        error: response.error,
      };
    }

    return {
      success: true,
      messageId: response.messageId || response.requestId,
      status: 'sent',
      message: response.message || 'Message sent successfully',
      estimatedDeliveryTime: new Date(Date.now() + 30000), // Estimate 30s delivery
      cost: this.estimateMessageCost(MessageType.TEXT),
    };
  }

  private estimateMessageCost(messageType: MessageType): number {
    // Cost estimates (update with actual MSG91 pricing)
    const costs = {
      [MessageType.TEXT]: 0.005,
      [MessageType.IMAGE]: 0.01,
      [MessageType.DOCUMENT]: 0.01,
      [MessageType.AUDIO]: 0.008,
      [MessageType.VIDEO]: 0.015,
      [MessageType.LOCATION]: 0.005,
      [MessageType.CONTACT]: 0.005,
      [MessageType.QUICK_REPLY]: 0.005,
      [MessageType.BUTTON]: 0.005,
      [MessageType.LIST]: 0.005,
    };

    return costs[messageType] || 0.005;
  }

  private estimateBulkCost(messageCount: number, messageType: MessageType): number {
    const unitCost = this.estimateMessageCost(messageType);
    const bulkDiscount = messageCount > 1000 ? 0.9 : messageCount > 100 ? 0.95 : 1;
    return messageCount * unitCost * bulkDiscount;
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test with a simple API call (you might need to implement a specific test endpoint)
      const testPayload = {
        test: true,
        authkey: this.authKey,
      };

      await this.callMsg91Api('/test', testPayload);
      return true;
    } catch (error) {
      this.logger.error('MSG91 connection validation failed', error);
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    try {
      const response = await this.callMsg91Api(`/status/${messageId}`, {});
      return response;
    } catch (error) {
      this.logger.error(`Failed to get delivery status for ${messageId}`, error);
      return null;
    }
  }

  async getAccountBalance(): Promise<any> {
    try {
      const response = await this.callMsg91Api('/balance', {});
      return response;
    } catch (error) {
      this.logger.error('Failed to get account balance', error);
      return null;
    }
  }
}