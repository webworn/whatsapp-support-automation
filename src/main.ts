import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as compression from 'compression';
import * as helmet from 'helmet';

import { AppModule } from './app.module';
import { createWinstonConfig } from './shared/utils/logger.util';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonConfig()),
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global pipes
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

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API versioning
  app.setGlobalPrefix(`api/${configService.get('API_VERSION', 'v1')}`);

  // Swagger documentation
  if (configService.get('ENABLE_SWAGGER', false)) {
    const config = new DocumentBuilder()
      .setTitle('WhatsApp Support Automation API')
      .setDescription('Enterprise-grade WhatsApp customer support automation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  
  if (configService.get('ENABLE_SWAGGER', false)) {
    logger.log(`Swagger documentation: http://localhost:${port}/docs`);
  }
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});