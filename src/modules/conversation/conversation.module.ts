import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule {}