import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    // Use standard database URL (private URL may not be available yet)
    const databaseUrl = configService.get<string>('DATABASE_URL');
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: ['error', 'warn'],
    });
    
    this.logger.log(`Using database URL: ${databaseUrl?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'undefined'}`);
  }

  async onModuleInit() {
    // Don't wait for database connection during startup - let app start immediately
    // Database connection will be established on first use
    this.connectInBackground();
  }

  private connectInBackground() {
    // Connect in background without blocking startup
    this.connectWithRetry().catch(error => {
      this.logger.error('Background database connection failed', error);
    });
  }

  private async connectWithRetry(maxAttempts = 5, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log(`Database connected successfully on attempt ${attempt}`);
        return;
      } catch (error) {
        this.logger.warn(`Database connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
        
        if (attempt === maxAttempts) {
          this.logger.error('Failed to connect to database after all attempts - running in degraded mode');
          // Don't throw error to allow application to start in degraded mode
          return;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // Exponential backoff
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  async enableShutdownHooks(app: any) {
    // Enable graceful shutdown hooks
    process.on('SIGINT', async () => {
      await app.close();
    });
    process.on('SIGTERM', async () => {
      await app.close();
    });
  }

  async ensureConnected(): Promise<void> {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn('Database not connected, attempting to connect...');
      await this.connectWithRetry(3, 1000); // Quick retry
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Quick connection test with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database health check timeout')), 3000)
      );
      
      const queryPromise = this.$queryRaw`SELECT 1`;
      
      await Promise.race([queryPromise, timeoutPromise]);
      return true;
    } catch (error) {
      this.logger.warn(`Database health check failed: ${error.message}`);
      return false;
    }
  }

  async clearTestData(): Promise<void> {
    if (this.configService.get('NODE_ENV') !== 'test') {
      throw new Error('clearTestData can only be used in test environment');
    }

    const tableNames = ['messages', 'conversations', 'users', 'sessions', 'llm_usage', 'webhook_logs'];
    
    for (const tableName of tableNames) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }

    this.logger.log('Test data cleared');
  }
}