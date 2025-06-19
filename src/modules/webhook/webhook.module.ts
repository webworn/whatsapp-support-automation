import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConversationModule } from '../conversation/conversation.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { LlmModule } from '../llm/llm.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [ConfigModule, PrismaModule, ConversationModule, LlmModule, DocumentModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}