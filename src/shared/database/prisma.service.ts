import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database - running in degraded mode', error);
      // Don't throw error to allow application to start in degraded mode
      // This allows the frontend to work even if database is not available
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

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
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