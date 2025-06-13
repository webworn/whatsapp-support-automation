import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { LlmModule } from '../llm/llm.module';
import { SessionModule } from '../../shared/session/session.module';

@Module({
  imports: [LlmModule, SessionModule],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}