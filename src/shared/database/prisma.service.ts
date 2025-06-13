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
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'info',
        },
      ],
    });

    // Log queries in development
    if (configService.get('NODE_ENV') === 'development') {
      this.$on('query', (e) => {
        this.logger.debug(`Query: ${e.query}`, {
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    // Log errors
    this.$on('error', (e) => {
      this.logger.error('Database error', {
        message: e.message,
        target: e.target,
      });
    });

    // Log warnings
    this.$on('warn', (e) => {
      this.logger.warn('Database warning', {
        message: e.message,
        target: e.target,
      });
    });

    // Log info
    this.$on('info', (e) => {
      this.logger.log('Database info', {
        message: e.message,
        target: e.target,
      });
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
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
    this.$on('beforeExit', async () => {
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