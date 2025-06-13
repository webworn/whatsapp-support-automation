import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/database/prisma.service';
import { QueueService } from '../../shared/queue/queue.service';
import { MSG91Service } from './msg91.service';
import {
  SendMessageDto,
  BulkMessageDto,
  DeliveryResponseDto,
  BulkDeliveryResponseDto,
  DeliveryStatsDto,
  MessagePriority,
} from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly msg91Service: MSG91Service,
    private readonly prismaService: PrismaService,
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto): Promise<DeliveryResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Sending message to ${sendMessageDto.phoneNumber}`, {
        messageType: sendMessageDto.messageType,
        priority: sendMessageDto.priority,
        hasQuickReplies: !!sendMessageDto.quickReplies?.length,
        hasButtons: !!sendMessageDto.buttons?.length,
      });

      // Check if message should be scheduled
      if (sendMessageDto.scheduledAt) {
        return await this.scheduleMessage(sendMessageDto);
      }

      // Send immediately
      const result = await this.msg91Service.sendMessage(sendMessageDto);

      // Track delivery metrics
      await this.trackDeliveryMetrics(sendMessageDto, result, Date.now() - startTime);

      // Emit delivery event
      this.eventEmitter.emit('message.delivery.attempted', {
        phoneNumber: sendMessageDto.phoneNumber,
        messageId: result.messageId,
        success: result.success,
        messageType: sendMessageDto.messageType,
        processingTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to ${sendMessageDto.phoneNumber}`, {
        error: error.message,
        messageType: sendMessageDto.messageType,
      });

      // Track failed delivery
      await this.trackDeliveryMetrics(
        sendMessageDto,
        {
          success: false,
          status: 'failed',
          message: 'Service error',
          error: error.message,
        },
        Date.now() - startTime,
      );

      throw error;
    }
  }

  async sendBulkMessages(bulkMessageDto: BulkMessageDto): Promise<BulkDeliveryResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Starting bulk message delivery`, {
        recipientCount: bulkMessageDto.phoneNumbers.length,
        messageType: bulkMessageDto.messageType,
        batchSize: bulkMessageDto.batchSize,
      });

      const result = await this.msg91Service.sendBulkMessages(bulkMessageDto);

      // Track bulk delivery metrics
      await this.trackBulkDeliveryMetrics(bulkMessageDto, result, Date.now() - startTime);

      // Emit bulk delivery event
      this.eventEmitter.emit('message.bulk.delivery.completed', {
        batchId: result.batchId,
        totalMessages: result.totalMessages,
        successCount: result.successCount,
        failureCount: result.failureCount,
        processingTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send bulk messages', {
        error: error.message,
        recipientCount: bulkMessageDto.phoneNumbers.length,
      });

      throw error;
    }
  }

  async queueMessage(sendMessageDto: SendMessageDto, delay: number = 0): Promise<{ queued: boolean; jobId?: string }> {
    try {
      const priority = this.getPriorityValue(sendMessageDto.priority);

      await this.queueService.addMessageJob(
        {
          phoneNumber: sendMessageDto.phoneNumber,
          message: sendMessageDto.message,
          messageType: sendMessageDto.messageType,
          priority,
        },
        delay,
      );

      this.logger.log(`Message queued for ${sendMessageDto.phoneNumber}`, {
        delay,
        priority: sendMessageDto.priority,
      });

      return { queued: true };
    } catch (error) {
      this.logger.error(`Failed to queue message for ${sendMessageDto.phoneNumber}`, error);
      return { queued: false };
    }
  }

  private async scheduleMessage(sendMessageDto: SendMessageDto): Promise<DeliveryResponseDto> {
    try {
      const scheduledTime = new Date(sendMessageDto.scheduledAt!);
      const delay = scheduledTime.getTime() - Date.now();

      if (delay <= 0) {
        // Send immediately if scheduled time is in the past
        return await this.msg91Service.sendMessage(sendMessageDto);
      }

      // Queue message with delay
      await this.queueMessage(sendMessageDto, delay);

      return {
        success: true,
        status: 'scheduled',
        message: `Message scheduled for delivery at ${scheduledTime.toISOString()}`,
        estimatedDeliveryTime: scheduledTime,
      };
    } catch (error) {
      this.logger.error(`Failed to schedule message for ${sendMessageDto.phoneNumber}`, error);
      throw error;
    }
  }

  private async trackDeliveryMetrics(
    request: SendMessageDto,
    result: DeliveryResponseDto,
    processingTime: number,
  ): Promise<void> {
    try {
      // Store delivery metrics in database for analytics
      await this.prismaService.message.create({
        data: {
          conversationId: 0, // This would be populated from conversation context
          direction: 'outbound',
          content: request.message,
          messageType: request.messageType || 'text',
          senderNumber: process.env.MSG91_SENDER_ID || '',
          recipientNumber: request.phoneNumber,
          deliveryStatus: result.status,
          msg91MessageId: result.messageId,
          processingTime,
          metadata: {
            priority: request.priority,
            hasQuickReplies: !!request.quickReplies?.length,
            hasButtons: !!request.buttons?.length,
            hasMedia: !!request.media,
            cost: result.cost || 0,
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to track delivery metrics', error);
    }
  }

  private async trackBulkDeliveryMetrics(
    request: BulkMessageDto,
    result: BulkDeliveryResponseDto,
    processingTime: number,
  ): Promise<void> {
    try {
      // Store bulk delivery metrics
      // This could be in a separate bulk_deliveries table
      this.logger.log('Bulk delivery metrics tracked', {
        batchId: result.batchId,
        totalMessages: result.totalMessages,
        successRate: (result.successCount / result.totalMessages) * 100,
        processingTime,
      });
    } catch (error) {
      this.logger.error('Failed to track bulk delivery metrics', error);
    }
  }

  async getDeliveryStats(days: number = 30): Promise<DeliveryStatsDto> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const messages = await this.prismaService.message.findMany({
        where: {
          direction: 'outbound',
          createdAt: {
            gte: startDate,
          },
        },
      });

      const totalSent = messages.length;
      const delivered = messages.filter(m => m.deliveryStatus === 'delivered').length;
      const failed = messages.filter(m => m.deliveryStatus === 'failed').length;
      const pending = messages.filter(m => ['pending', 'sent'].includes(m.deliveryStatus)).length;

      // Calculate average delivery time
      const deliveredMessages = messages.filter(m => m.deliveredAt);
      const averageDeliveryTime = deliveredMessages.length > 0
        ? deliveredMessages.reduce((sum, m) => {
            const deliveryTime = (m.deliveredAt!.getTime() - m.createdAt.getTime()) / 1000;
            return sum + deliveryTime;
          }, 0) / deliveredMessages.length
        : 0;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

      // Calculate total cost
      const totalCost = messages.reduce((sum, m) => {
        const cost = m.metadata?.cost || 0;
        return sum + cost;
      }, 0);

      // Group by message type
      const messagesByType: Record<string, number> = {};
      const messagesByStatus: Record<string, number> = {};

      for (const message of messages) {
        messagesByType[message.messageType] = (messagesByType[message.messageType] || 0) + 1;
        messagesByStatus[message.deliveryStatus] = (messagesByStatus[message.deliveryStatus] || 0) + 1;
      }

      return {
        totalSent,
        delivered,
        failed,
        pending,
        averageDeliveryTime,
        deliveryRate,
        totalCost,
        messagesByType,
        messagesByStatus,
      };
    } catch (error) {
      this.logger.error('Failed to get delivery stats', error);
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
        averageDeliveryTime: 0,
        deliveryRate: 0,
        totalCost: 0,
        messagesByType: {},
        messagesByStatus: {},
      };
    }
  }

  async retryFailedDeliveries(limit: number = 50): Promise<number> {
    try {
      const failedMessages = await this.prismaService.message.findMany({
        where: {
          direction: 'outbound',
          deliveryStatus: 'failed',
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

      for (const message of failedMessages) {
        try {
          // Queue message for retry
          await this.queueMessage({
            phoneNumber: message.recipientNumber!,
            message: message.content,
            messageType: message.messageType as any,
            priority: MessagePriority.HIGH, // High priority for retries
          });

          retryCount++;
        } catch (retryError) {
          this.logger.error(`Failed to retry message ${message.id}`, retryError);
        }
      }

      this.logger.log(`Queued ${retryCount} failed messages for retry`);
      return retryCount;
    } catch (error) {
      this.logger.error('Failed to retry failed deliveries', error);
      return 0;
    }
  }

  async validateService(): Promise<boolean> {
    try {
      return await this.msg91Service.validateConnection();
    } catch (error) {
      this.logger.error('Delivery service validation failed', error);
      return false;
    }
  }

  private getPriorityValue(priority?: MessagePriority): number {
    const priorityMap = {
      [MessagePriority.URGENT]: 10,
      [MessagePriority.HIGH]: 7,
      [MessagePriority.NORMAL]: 5,
      [MessagePriority.LOW]: 1,
    };

    return priorityMap[priority || MessagePriority.NORMAL];
  }

  async getQueueStatus(): Promise<any> {
    try {
      return await this.queueService.getMessageQueueStats();
    } catch (error) {
      this.logger.error('Failed to get queue status', error);
      return null;
    }
  }

  async pauseDeliveries(): Promise<void> {
    await this.queueService.pauseMessageQueue();
    this.logger.log('Message deliveries paused');
  }

  async resumeDeliveries(): Promise<void> {
    await this.queueService.resumeMessageQueue();
    this.logger.log('Message deliveries resumed');
  }
}