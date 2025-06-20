import { Controller, Get, Param, Optional } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { PrismaService } from './shared/database/prisma.service';
import { LlmService } from './modules/llm/llm.service';
import { WhatsAppService } from './modules/whatsapp/whatsapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Optional() private readonly llmService?: LlmService,
    @Optional() private readonly whatsappService?: WhatsAppService,
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

  @Get('debug-jwt')
  @Public()
  async debugJWT() {
    try {
      // Check if JWT_SECRET is available
      const jwtSecret = process.env.JWT_SECRET;
      
      // Check recent user sessions
      const recentSessions = await this.prismaService.userSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      });

      return {
        status: 'success',
        data: {
          jwtSecretExists: !!jwtSecret,
          jwtSecretLength: jwtSecret ? jwtSecret.length : 0,
          recentSessionsCount: recentSessions.length,
          recentSessions: recentSessions.map(s => ({
            id: s.id,
            userId: s.userId,
            userEmail: s.user.email,
            expiresAt: s.expiresAt,
            createdAt: s.createdAt,
            isExpired: s.expiresAt < new Date()
          }))
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Debug JWT check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-jwt/:token')
  @Public()
  async testJWT(@Param('token') token: string) {
    try {
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET;
      
      // Try to decode the token
      const decoded = jwt.verify(token, jwtSecret);
      
      // Check if session exists
      const session = await this.prismaService.userSession.findUnique({
        where: { id: decoded.sessionId },
        include: { user: { select: { email: true } } }
      });

      return {
        status: 'success',
        data: {
          decoded,
          sessionFound: !!session,
          sessionDetails: session ? {
            id: session.id,
            userId: session.userId,
            userEmail: session.user.email,
            expiresAt: session.expiresAt,
            isExpired: session.expiresAt < new Date()
          } : null
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'JWT test failed',
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

  @Get('test-llm')
  @Public()
  async testLLM() {
    try {
      if (!this.llmService) {
        return {
          status: 'error',
          message: 'LLM service not available',
          timestamp: new Date().toISOString(),
        };
      }

      const testResult = await this.llmService.testConnection();
      
      if (testResult.status === 'connected') {
        const testResponse = await this.llmService.generateResponse({
          messages: [
            { role: 'user', content: 'Hello! Can you help me test the AI integration?' }
          ],
          businessName: 'Test Business',
          customerName: 'Test Customer',
        });

        return {
          status: 'success',
          message: 'LLM integration working correctly',
          data: {
            connectionTest: testResult,
            testResponse: {
              content: testResponse.content,
              model: testResponse.model,
              processingTimeMs: testResponse.processingTimeMs,
              tokensUsed: testResponse.tokensUsed,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          status: 'error',
          message: 'LLM connection failed',
          error: testResult.error,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'LLM test failed',
        error: error.message,
        envVars: {
          hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
          openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
          primaryModel: process.env.OPENROUTER_PRIMARY_MODEL || 'not set',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-whatsapp')
  @Public()
  async testWhatsApp() {
    try {
      if (!this.whatsappService) {
        return {
          status: 'error',
          message: 'WhatsApp service not available',
          timestamp: new Date().toISOString(),
        };
      }

      const connectionTest = await this.whatsappService.testConnection();
      
      return {
        status: connectionTest.status === 'connected' ? 'success' : 'error',
        message: connectionTest.status === 'connected' 
          ? 'WhatsApp API connection successful' 
          : 'WhatsApp API connection failed',
        data: {
          connectionTest,
          credentials: {
            hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
            hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
            accessTokenLength: process.env.WHATSAPP_ACCESS_TOKEN?.length || 0,
          }
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'WhatsApp test failed',
        error: error.message,
        envVars: {
          hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
          hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}