import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  let app: any;
  try {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
  } catch (error) {
    console.error('❌ Failed to create NestJS application:', error);
    throw error;
  }
  
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

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

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
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