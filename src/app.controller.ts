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

  @Get('db-schema')
  @Public()
  async checkDatabaseSchema() {
    try {
      // Check if tables exist
      const tables = await this.prismaService.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;

      // Check if users table exists and get its structure
      let userTableStructure = null;
      try {
        userTableStructure = await this.prismaService.$queryRaw`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          ORDER BY ordinal_position;
        `;
      } catch (error) {
        userTableStructure = { error: 'Users table does not exist' };
      }

      // Test if we can query users table
      let userCount: number | string = 0;
      try {
        const countResult = await this.prismaService.$queryRaw`SELECT COUNT(*) as count FROM users`;
        userCount = (countResult as any)[0]?.count || 0;
      } catch (error) {
        userCount = `Error: ${error.message}`;
      }

      return {
        status: 'success',
        message: 'Database schema check completed',
        data: {
          tables,
          userTableStructure,
          userCount,
          databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database schema check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('db-migrate')
  @Public()
  async runMigrations() {
    try {
      // Use Prisma's db push to create tables if they don't exist
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      if (process.env.NODE_ENV === 'production') {
        // In production, use db push since we don't have migration files
        const result = await execAsync('npx prisma db push', { 
          timeout: 30000,
          env: { ...process.env }
        });
        
        return {
          status: 'success',
          message: 'Database schema created/updated in production',
          output: result.stdout,
          error: result.stderr,
          timestamp: new Date().toISOString(),
        };
      } else {
        // In development, use db push
        const result = await execAsync('npx prisma db push --force-reset', { 
          timeout: 30000,
          env: { ...process.env }
        });
        
        return {
          status: 'success',
          message: 'Database schema pushed successfully',
          output: result.stdout,
          error: result.stderr,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Database migration failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}