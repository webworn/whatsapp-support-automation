import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// Feature modules
import { ConversationModule } from './modules/conversation/conversation.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { DocumentModule } from './modules/document/document.module';
import { DashboardModule } from './gateways/dashboard.module';
import { LlmModule } from './modules/llm/llm.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrontendController } from './frontend.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),


    // Core modules
    PrismaModule,
    AuthModule,

    // Feature modules
    ConversationModule,
    WebhookModule,
    DocumentModule,
    DashboardModule,
    LlmModule,
    WhatsAppModule,
  ],
  controllers: [AppController, FrontendController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}