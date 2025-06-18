import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { PrismaService } from './shared/database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  async getHealth() {
    const baseHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'WhatsApp AI Railway Template',
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Don't let database issues break the health check
    try {
      const dbHealthy = await this.prismaService.healthCheck();
      return {
        ...baseHealth,
        database: {
          status: dbHealthy ? 'connected' : 'disconnected',
          url: process.env.DATABASE_URL ? 'configured' : 'missing',
        }
      };
    } catch (error) {
      return {
        ...baseHealth,
        database: {
          status: 'error',
          error: error.message,
          url: process.env.DATABASE_URL ? 'configured' : 'missing',
        }
      };
    }
  }

  @Get('db-test')
  @Public()
  async testDatabase() {
    try {
      const result = await this.prismaService.$queryRaw`SELECT 1 as test`;
      return {
        status: 'success',
        message: 'Database connection successful',
        result,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        timestamp: new Date().toISOString(),
      };
    }
  }
}