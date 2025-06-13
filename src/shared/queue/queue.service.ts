import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface WebhookJobData {
  payload: any;
  signature: string;
  source: string;
  receivedAt: Date;
}

export interface MessageJobData {
  phoneNumber: string;
  message: string;
  messageType?: string;
  priority?: number;
  retryCount?: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('webhook') private webhookQueue: Queue,
    @InjectQueue('message') private messageQueue: Queue,
  ) {}

  async addWebhookJob(data: WebhookJobData, priority: number = 0): Promise<void> {
    try {
      await this.webhookQueue.add('process-webhook', data, {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      this.logger.log('Added webhook job to queue', {
        source: data.source,
        priority,
      });
    } catch (error) {
      this.logger.error('Failed to add webhook job to queue', error);
      throw error;
    }
  }

  async addMessageJob(data: MessageJobData, delay: number = 0): Promise<void> {
    try {
      const jobOptions: any = {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      };

      if (delay > 0) {
        jobOptions.delay = delay;
      }

      if (data.priority) {
        jobOptions.priority = data.priority;
      }

      await this.messageQueue.add('send-message', data, jobOptions);

      this.logger.log('Added message job to queue', {
        phoneNumber: data.phoneNumber,
        delay,
        priority: data.priority,
      });
    } catch (error) {
      this.logger.error('Failed to add message job to queue', error);
      throw error;
    }
  }

  async getWebhookQueueStats(): Promise<any> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.webhookQueue.getWaiting(),
        this.webhookQueue.getActive(),
        this.webhookQueue.getCompleted(),
        this.webhookQueue.getFailed(),
        this.webhookQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    } catch (error) {
      this.logger.error('Failed to get webhook queue stats', error);
      return null;
    }
  }

  async getMessageQueueStats(): Promise<any> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.messageQueue.getWaiting(),
        this.messageQueue.getActive(),
        this.messageQueue.getCompleted(),
        this.messageQueue.getFailed(),
        this.messageQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    } catch (error) {
      this.logger.error('Failed to get message queue stats', error);
      return null;
    }
  }

  async pauseWebhookQueue(): Promise<void> {
    await this.webhookQueue.pause();
    this.logger.log('Webhook queue paused');
  }

  async resumeWebhookQueue(): Promise<void> {
    await this.webhookQueue.resume();
    this.logger.log('Webhook queue resumed');
  }

  async pauseMessageQueue(): Promise<void> {
    await this.messageQueue.pause();
    this.logger.log('Message queue paused');
  }

  async resumeMessageQueue(): Promise<void> {
    await this.messageQueue.resume();
    this.logger.log('Message queue resumed');
  }

  async clearWebhookQueue(): Promise<void> {
    await this.webhookQueue.empty();
    this.logger.log('Webhook queue cleared');
  }

  async clearMessageQueue(): Promise<void> {
    await this.messageQueue.empty();
    this.logger.log('Message queue cleared');
  }
}