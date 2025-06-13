// src/server.ts - Server Entry Point
import { WhatsAppSupportApp } from './app';
import { logger } from './utils/logger.util';
import { config } from './config/app.config';

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('🚨 Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
async function bootstrap(): Promise<void> {
  try {
    logger.info('🔄 Starting WhatsApp Support Automation...');
    logger.info(`📋 Configuration: ${config.app.environment} environment`);
    
    const app = new WhatsAppSupportApp();
    app.listen();
    
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Initialize application
bootstrap();