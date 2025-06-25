import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { LlmModule } from '../llm/llm.module';
import { ConversationModule } from '../conversation/conversation.module';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    WhatsAppModule,
    LlmModule,
    ConversationModule,
  ],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}