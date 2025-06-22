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

    // Static file serving for Next.js frontend assets
    ServeStaticModule.forRoot({
      rootPath: process.env.NODE_ENV === 'production' 
        ? join(__dirname, '..', '..', 'frontend', '.next', 'static')
        : join(process.cwd(), 'frontend', '.next', 'static'),
      serveRoot: '/_next/static',
      exclude: ['/api*'],
      serveStaticOptions: {
        cacheControl: true,
        maxAge: '1d',
        etag: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: process.env.NODE_ENV === 'production'
        ? join(__dirname, '..', '..', 'frontend', 'public') 
        : join(process.cwd(), 'frontend', 'public'),
      serveRoot: '/public',
      exclude: ['/api*'],
      serveStaticOptions: {
        cacheControl: true,
        maxAge: '1h',
        etag: true,
      },
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
  controllers: [FrontendController, AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}