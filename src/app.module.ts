import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

// Core modules
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// Feature modules
import { ConversationModule } from './modules/conversation/conversation.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { DocumentModule } from './modules/document/document.module';
import { DashboardModule } from './gateways/dashboard.module';
// import { LlmModule } from './modules/llm/llm.module'; // Will add in Phase 3

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

    // Serve frontend static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', '.next', 'static'),
      serveRoot: '/_next/static',
    }),

    // Core modules
    PrismaModule,
    AuthModule,

    // Feature modules
    ConversationModule,
    WebhookModule,
    DocumentModule,
    DashboardModule,
    // LlmModule, // Will add in Phase 3
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