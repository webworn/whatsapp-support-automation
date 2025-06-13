import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConversationModule } from '../conversation/conversation.module';
import { QueueModule } from '../../shared/queue/queue.module';

@Module({
  imports: [
    ConversationModule,
    QueueModule,
    ThrottlerModule.forRoot([
      {
        name: 'webhook',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}