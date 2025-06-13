import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/database/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import {
  WebhookPayloadDto,
  WebhookStatsDto,
  RawWebhookData,
  WebhookSource,
  WebhookType,
  MSG91MessageDto,
  MSG91DeliveryDto,
  MSG91ReadDto,
  WhatsAppBusinessWebhookDto,
  WhatsAppBusinessMessageDto,
} from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processTestWebhook(
    payload: WebhookPayloadDto,
    rawData: RawWebhookData,
  ): Promise<{ webhookId: string }> {
    const webhookLog = await this.logWebhook(WebhookSource.TEST, rawData, true);

    try {
      switch (payload.type) {
        case WebhookType.MESSAGE:
          await this.processTestMessage(payload.data);
          break;
        case WebhookType.DELIVERY:
          await this.processTestDelivery(payload.data);
          break;
        case WebhookType.READ:
          await this.processTestRead(payload.data);
          break;
        default:
          this.logger.warn(`Unknown test webhook type: ${payload.type}`);
      }

      // Update webhook log as processed
      await this.updateWebhookLog(webhookLog.id, true);

      this.logger.log(`Processed test webhook: ${payload.type}`);

      return { webhookId: webhookLog.id.toString() };
    } catch (error) {
      // Update webhook log with error
      await this.updateWebhookLog(webhookLog.id, false, error.message);
      throw error;
    }
  }

  private async processTestMessage(data: MSG91MessageDto): Promise<void> {
    this.logger.log(`Processing test message from ${data.from}`);

    // Use the conversation service to process the message
    await this.conversationService.processIncomingMessage({
      phoneNumber: data.from,
      message: data.text,
      messageType: data.type || 'text',
      msg91MessageId: data.messageId,
      timestamp: data.timestamp,
      metadata: {
        source: 'test_webhook',
        originalData: data,
      },
    });

    // Emit test event
    this.eventEmitter.emit('webhook.test.message', {
      from: data.from,
      message: data.text,
      messageId: data.messageId,
      timestamp: new Date(),
    });
  }

  private async processTestDelivery(data: MSG91DeliveryDto): Promise<void> {
    this.logger.log(`Processing test delivery status: ${data.status} for ${data.messageId}`);

    // Update message delivery status
    const updated = await this.conversationService.updateMessageDeliveryStatus(
      data.messageId,
      data.status,
    );

    if (!updated) {
      this.logger.warn(`Message not found for test delivery status: ${data.messageId}`);
    }

    // Emit test event
    this.eventEmitter.emit('webhook.test.delivery', {
      messageId: data.messageId,
      status: data.status,
      phoneNumber: data.phoneNumber,
      timestamp: new Date(),
    });
  }

  private async processTestRead(data: MSG91ReadDto): Promise<void> {
    this.logger.log(`Processing test read status for ${data.messageId}`);

    // Update message status to read
    const updated = await this.conversationService.updateMessageDeliveryStatus(
      data.messageId,
      'read',
    );

    if (!updated) {
      this.logger.warn(`Message not found for test read status: ${data.messageId}`);
    }

    // Emit test event
    this.eventEmitter.emit('webhook.test.read', {
      messageId: data.messageId,
      phoneNumber: data.phoneNumber,
      timestamp: new Date(),
    });
  }

  async logWebhook(
    source: WebhookSource,
    rawData: RawWebhookData,
    isValid: boolean,
    error?: string,
  ): Promise<any> {
    try {
      return await this.prismaService.webhookLog.create({
        data: {
          source,
          payload: rawData.body,
          signature: rawData.headers['x-signature'] || rawData.headers['X-MSG91-Signature'] || '',
          isValid,
          processed: false,
          error,
        },
      });
    } catch (logError) {
      this.logger.error('Failed to log webhook', logError);
      // Return a mock webhook log if database logging fails
      return { id: Date.now() };
    }
  }

  async updateWebhookLog(webhookId: number, processed: boolean, error?: string): Promise<void> {
    try {
      await this.prismaService.webhookLog.update({
        where: { id: webhookId },
        data: {
          processed,
          error,
          isValid: !error,
        },
      });
    } catch (updateError) {
      this.logger.error(`Failed to update webhook log ${webhookId}`, updateError);
    }
  }

  async getWebhookStats(days: number = 30): Promise<WebhookStatsDto> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const webhooks = await this.prismaService.webhookLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalReceived = webhooks.length;
      const successfullyProcessed = webhooks.filter(w => w.processed && w.isValid).length;
      const failed = webhooks.filter(w => !w.processed || !w.isValid).length;

      // Calculate average processing time (if we had that data)
      const averageProcessingTime = 0; // Would need to track this

      // Group by source
      const bySource: Record<string, number> = {};
      const byType: Record<string, number> = {};

      for (const webhook of webhooks) {
        bySource[webhook.source] = (bySource[webhook.source] || 0) + 1;
        
        // Extract type from payload if available
        const type = (webhook.payload as any)?.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      }

      // Get recent errors
      const recentErrors = webhooks
        .filter(w => w.error)
        .slice(0, 10)
        .map(w => ({
          timestamp: w.createdAt,
          error: w.error!,
          source: w.source,
          type: (w.payload as any)?.type || 'unknown',
        }));

      return {
        totalReceived,
        successfullyProcessed,
        failed,
        averageProcessingTime,
        bySource,
        byType,
        recentErrors,
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats', error);
      return {
        totalReceived: 0,
        successfullyProcessed: 0,
        failed: 0,
        averageProcessingTime: 0,
        bySource: {},
        byType: {},
        recentErrors: [],
      };
    }
  }

  async getRecentActivity(limit: number = 10): Promise<any> {
    try {
      const recentWebhooks = await this.prismaService.webhookLog.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        select: {
          id: true,
          source: true,
          isValid: true,
          processed: true,
          error: true,
          createdAt: true,
          payload: true,
        },
      });

      return recentWebhooks.map(webhook => ({
        id: webhook.id,
        source: webhook.source,
        type: (webhook.payload as any)?.type || 'unknown',
        status: webhook.processed && webhook.isValid ? 'success' : 'failed',
        error: webhook.error,
        timestamp: webhook.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get recent webhook activity', error);
      return [];
    }
  }

  async cleanupOldWebhookLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prismaService.webhookLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          processed: true, // Only delete processed webhooks
        },
      });

      this.logger.log(`Cleaned up ${result.count} old webhook logs`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to cleanup old webhook logs', error);
      return 0;
    }
  }

  async retryFailedWebhooks(limit: number = 50): Promise<number> {
    try {
      const failedWebhooks = await this.prismaService.webhookLog.findMany({
        where: {
          OR: [
            { processed: false },
            { isValid: false },
          ],
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      let retryCount = 0;

      for (const webhook of failedWebhooks) {
        try {
          // Emit retry event for manual handling
          this.eventEmitter.emit('webhook.retry', {
            webhookId: webhook.id,
            source: webhook.source,
            payload: webhook.payload,
            originalError: webhook.error,
          });

          retryCount++;
        } catch (retryError) {
          this.logger.error(`Failed to retry webhook ${webhook.id}`, retryError);
        }
      }

      this.logger.log(`Initiated retry for ${retryCount} failed webhooks`);
      return retryCount;
    } catch (error) {
      this.logger.error('Failed to retry failed webhooks', error);
      return 0;
    }
  }

  async processWhatsAppBusinessWebhook(
    payload: WhatsAppBusinessWebhookDto,
    rawData: RawWebhookData,
  ): Promise<{ webhookId: string }> {
    const webhookLog = await this.logWebhook(WebhookSource.WHATSAPP_BUSINESS, rawData, true);

    try {
      // Process each entry in the webhook
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.processWhatsAppBusinessMessages(change.value);
          } else if (change.field === 'message_status') {
            await this.processWhatsAppBusinessStatuses(change.value);
          }
        }
      }

      // Update webhook log as processed
      await this.updateWebhookLog(webhookLog.id, true);

      this.logger.log('Processed WhatsApp Business webhook successfully');

      return { webhookId: webhookLog.id.toString() };
    } catch (error) {
      // Update webhook log with error
      await this.updateWebhookLog(webhookLog.id, false, error.message);
      throw error;
    }
  }

  private async processWhatsAppBusinessMessages(value: any): Promise<void> {
    if (!value.messages || !Array.isArray(value.messages)) {
      return;
    }

    for (const message of value.messages) {
      try {
        await this.processWhatsAppBusinessMessage(message, value);
      } catch (error) {
        this.logger.error('Failed to process WhatsApp Business message', {
          error: error.message,
          messageId: message.id,
          from: message.from,
        });
      }
    }
  }

  private async processWhatsAppBusinessMessage(
    message: WhatsAppBusinessMessageDto,
    value: any,
  ): Promise<void> {
    this.logger.log(`Processing WhatsApp Business message from ${message.from}`, {
      messageId: message.id,
      type: message.type,
    });

    // Extract message content based on type
    let messageContent = '';
    let messageType = message.type;

    switch (message.type) {
      case 'text':
        messageContent = message.text?.body || '';
        break;
      case 'interactive':
        if (message.interactive?.button_reply) {
          messageContent = message.interactive.button_reply.title;
          messageType = 'button_reply';
        } else if (message.interactive?.list_reply) {
          messageContent = message.interactive.list_reply.title;
          messageType = 'list_reply';
        }
        break;
      case 'image':
        messageContent = message.image?.caption || '[Image message]';
        break;
      case 'document':
        messageContent = message.document?.caption || message.document?.filename || '[Document message]';
        break;
      case 'audio':
        messageContent = '[Audio message]';
        break;
      case 'video':
        messageContent = message.video?.caption || '[Video message]';
        break;
      default:
        messageContent = `[${message.type} message]`;
    }

    // Get contact name if available
    const contact = value.contacts?.find((c: any) => c.wa_id === message.from);
    const contactName = contact?.profile?.name;

    // Use the conversation service to process the message
    await this.conversationService.processIncomingMessage({
      phoneNumber: message.from,
      message: messageContent,
      messageType: messageType as any,
      msg91MessageId: message.id, // Use WhatsApp message ID
      timestamp: message.timestamp,
      metadata: {
        source: 'whatsapp_business',
        contactName,
        originalMessage: message,
        phoneNumberId: value.metadata?.phone_number_id,
        displayPhoneNumber: value.metadata?.display_phone_number,
      },
    });

    // Emit WhatsApp Business event
    this.eventEmitter.emit('webhook.whatsapp_business.message', {
      from: message.from,
      message: messageContent,
      messageId: message.id,
      messageType: messageType,
      contactName,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
    });
  }

  private async processWhatsAppBusinessStatuses(value: any): Promise<void> {
    if (!value.statuses || !Array.isArray(value.statuses)) {
      return;
    }

    for (const status of value.statuses) {
      try {
        await this.processWhatsAppBusinessStatus(status);
      } catch (error) {
        this.logger.error('Failed to process WhatsApp Business status', {
          error: error.message,
          messageId: status.id,
          status: status.status,
        });
      }
    }
  }

  private async processWhatsAppBusinessStatus(status: any): Promise<void> {
    this.logger.log(`Processing WhatsApp Business status: ${status.status} for ${status.id}`);

    // Update message delivery status
    const updated = await this.conversationService.updateMessageDeliveryStatus(
      status.id,
      status.status,
    );

    if (!updated) {
      this.logger.warn(`Message not found for WhatsApp Business status: ${status.id}`);
    }

    // Emit status event
    this.eventEmitter.emit('webhook.whatsapp_business.status', {
      messageId: status.id,
      status: status.status,
      recipientId: status.recipient_id,
      timestamp: new Date(parseInt(status.timestamp) * 1000),
      conversation: status.conversation,
      pricing: status.pricing,
    });
  }
}