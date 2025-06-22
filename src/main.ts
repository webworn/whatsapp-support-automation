import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  let app: NestExpressApplication;
  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
  } catch (error) {
    console.error('❌ Failed to create NestJS application:', error);
    throw error;
  }
  
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configure static file serving for Next.js assets
  const isDev = configService.get('NODE_ENV') !== 'production';
  
  if (!isDev) {
    // In production, serve Next.js static files
    const staticPath = join(__dirname, '..', 'frontend', '.next', 'static');
    const publicPath = join(__dirname, '..', 'frontend', 'public');
    
    // Serve Next.js static assets with proper cache headers
    app.useStaticAssets(staticPath, {
      prefix: '/_next/static/',
      maxAge: '1y', // Cache static assets for 1 year
      immutable: true,
    });
    
    // Serve public assets (favicons, etc.)
    app.useStaticAssets(publicPath, {
      prefix: '/',
      maxAge: '1d', // Cache public assets for 1 day
    });
    
    logger.log(`📁 Static files served from: ${staticPath}`);
    logger.log(`📁 Public files served from: ${publicPath}`);
  }

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // CORS configuration for frontend-backend integration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      configService.get('RAILWAY_PUBLIC_DOMAIN') ? `https://${configService.get('RAILWAY_PUBLIC_DOMAIN')}` : '',
      'https://whatsapp-support-automation-production.up.railway.app'
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    // Removed x-user-id and x-password headers for security
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Railway uses PORT environment variable
  const port = configService.get('PORT', 3000);
  const host = configService.get('NODE_ENV') === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, host);

  logger.log(`🚀 WhatsApp AI Railway Template is running on: http://${host}:${port}`);
  logger.log(`📝 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`🔑 Auth endpoints: http://${host}:${port}/api/auth/*`);
  
  if (configService.get('NODE_ENV') === 'production') {
    const publicDomain = configService.get('RAILWAY_PUBLIC_DOMAIN');
    const privateDomain = configService.get('RAILWAY_PRIVATE_DOMAIN');
    
    logger.log(`🌍 Public URL: https://${publicDomain || 'your-app.railway.app'}`);
    if (privateDomain) {
      logger.log(`🔒 Private URL: https://${privateDomain} (internal services)`);
    }
  }
}

bootstrap().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});