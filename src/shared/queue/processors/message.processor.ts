import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
// Forward declaration to avoid circular dependency
// import { DeliveryService } from '../../../modules/delivery/delivery.service';
import { MessageJobData } from '../queue.service';

@Processor('message')
export class MessageProcessor {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor() {
    // DeliveryService will be injected when this processor is used
  }

  @Process('send-message')
  async sendMessage(job: Job<MessageJobData>) {
    const { phoneNumber, message, messageType, priority, retryCount = 0 } = job.data;

    this.logger.log(`Processing message delivery job`, {
      jobId: job.id,
      phoneNumber,
      messageType,
      priority,
      retryCount,
    });

    try {
      // This will be implemented when DeliveryService is properly integrated
      this.logger.log(`Message delivery queued`, {
        jobId: job.id,
        phoneNumber,
        messageType,
        priority,
      });

      // Placeholder for actual delivery logic
      return {
        success: true,
        status: 'queued',
        message: 'Message queued for delivery',
      };
    } catch (error) {
      this.logger.error(`Failed to deliver message`, {
        jobId: job.id,
        phoneNumber,
        error: error.message,
        retryCount,
      });

      // Update retry count for tracking
      job.data.retryCount = retryCount + 1;

      throw error;
    }
  }

  @Process('send-bulk-messages')
  async sendBulkMessages(job: Job<any>) {
    const bulkData = job.data;

    this.logger.log(`Processing bulk message delivery job`, {
      jobId: job.id,
      recipientCount: bulkData.phoneNumbers?.length,
    });

    try {
      // Placeholder for bulk message processing
      this.logger.log(`Bulk messages queued`, {
        jobId: job.id,
        recipientCount: bulkData.phoneNumbers?.length,
      });

      return {
        success: true,
        status: 'queued',
        message: 'Bulk messages queued for processing',
      };
    } catch (error) {
      this.logger.error(`Failed to process bulk messages`, {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }
}