import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConversationService } from '../../../modules/conversation/conversation.service';
import { WebhookJobData } from '../queue.service';
import { validateWebhookSignature } from '../../utils/validation.util';
import { PrismaService } from '../../database/prisma.service';

@Processor('webhook')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly prismaService: PrismaService,
  ) {}

  @Process('process-webhook')
  async processWebhook(job: Job<WebhookJobData>) {
    const { payload, signature, source, receivedAt } = job.data;

    this.logger.log(`Processing webhook from ${source}`, {
      jobId: job.id,
      receivedAt,
    });

    try {
      // Log webhook for debugging
      await this.logWebhook(payload, signature, source);

      // Validate webhook signature
      if (source === 'msg91') {
        const isValid = await this.validateMsg91Webhook(payload, signature);
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }

      // Process based on webhook type
      if (source === 'msg91') {
        await this.processMsg91Webhook(payload);
      } else {
        this.logger.warn(`Unknown webhook source: ${source}`);
      }

      this.logger.log(`Successfully processed webhook from ${source}`, {
        jobId: job.id,
        processingTime: Date.now() - receivedAt.getTime(),
      });

    } catch (error) {
      this.logger.error(`Failed to process webhook from ${source}`, {
        error: error.message,
        jobId: job.id,
        payload: JSON.stringify(payload).substring(0, 500),
      });

      // Update webhook log with error
      await this.updateWebhookLog(payload, false, error.message);
      
      throw error;
    }
  }

  private async validateMsg91Webhook(payload: any, signature: string): Promise<boolean> {
    try {
      const webhookSecret = process.env.MSG91_WEBHOOK_SECRET;
      if (!webhookSecret) {
        this.logger.warn('MSG91 webhook secret not configured');
        return false;
      }

      const payloadString = JSON.stringify(payload);
      return validateWebhookSignature(payloadString, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Error validating MSG91 webhook signature', error);
      return false;
    }
  }

  private async processMsg91Webhook(payload: any): Promise<void> {
    const { type, data } = payload;

    switch (type) {
      case 'message':
        await this.processIncomingMessage(data);
        break;
      
      case 'delivery':
        await this.processDeliveryStatus(data);
        break;
      
      case 'read':
        await this.processReadStatus(data);
        break;
      
      default:
        this.logger.warn(`Unknown MSG91 webhook type: ${type}`);
    }
  }

  private async processIncomingMessage(data: any): Promise<void> {
    try {
      const { from, text, timestamp, messageId, type = 'text' } = data;

      if (!from || !text) {
        throw new Error('Missing required fields in message data');
      }

      // Process the message through conversation service
      await this.conversationService.processIncomingMessage({
        phoneNumber: from,
        message: text,
        messageType: type,
        msg91MessageId: messageId,
        timestamp,
        metadata: { 
          webhookData: data,
          processedAt: new Date().toISOString(),
        },
      });

      this.logger.log(`Processed incoming message from ${from}`, {
        messageId,
        messageLength: text.length,
      });

    } catch (error) {
      this.logger.error('Failed to process incoming message', {
        error: error.message,
        data: JSON.stringify(data).substring(0, 200),
      });
      throw error;
    }
  }

  private async processDeliveryStatus(data: any): Promise<void> {
    try {
      const { messageId, status, timestamp } = data;

      if (!messageId || !status) {
        throw new Error('Missing required fields in delivery status data');
      }

      // Update message delivery status
      const updated = await this.conversationService.updateMessageDeliveryStatus(messageId, status);

      if (updated) {
        this.logger.log(`Updated delivery status for message ${messageId}`, {
          status,
          timestamp,
        });
      } else {
        this.logger.warn(`Message not found for delivery status update: ${messageId}`);
      }

    } catch (error) {
      this.logger.error('Failed to process delivery status', {
        error: error.message,
        data: JSON.stringify(data).substring(0, 200),
      });
      throw error;
    }
  }

  private async processReadStatus(data: any): Promise<void> {
    try {
      const { messageId, timestamp } = data;

      if (!messageId) {
        throw new Error('Missing messageId in read status data');
      }

      // Update message delivery status to read
      const updated = await this.conversationService.updateMessageDeliveryStatus(messageId, 'read');

      if (updated) {
        this.logger.log(`Updated read status for message ${messageId}`, {
          timestamp,
        });
      } else {
        this.logger.warn(`Message not found for read status update: ${messageId}`);
      }

    } catch (error) {
      this.logger.error('Failed to process read status', {
        error: error.message,
        data: JSON.stringify(data).substring(0, 200),
      });
      throw error;
    }
  }

  private async logWebhook(payload: any, signature: string, source: string): Promise<void> {
    try {
      await this.prismaService.webhookLog.create({
        data: {
          source,
          payload,
          signature,
          isValid: true, // Will be updated if validation fails
          processed: false, // Will be updated after processing
        },
      });
    } catch (error) {
      this.logger.error('Failed to log webhook', error);
    }
  }

  private async updateWebhookLog(payload: any, processed: boolean, error?: string): Promise<void> {
    try {
      // Find the webhook log by payload (assuming recent entry)
      const log = await this.prismaService.webhookLog.findFirst({
        where: {
          payload: {
            equals: payload,
          },
          createdAt: {
            gte: new Date(Date.now() - 60000), // Within last minute
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (log) {
        await this.prismaService.webhookLog.update({
          where: { id: log.id },
          data: {
            processed,
            error,
            isValid: !error,
          },
        });
      }
    } catch (updateError) {
      this.logger.error('Failed to update webhook log', updateError);
    }
  }
}