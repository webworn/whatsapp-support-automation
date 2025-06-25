import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(private readonly testService: TestService) {}

  @Get('connection')
  @Public()
  async checkConnection() {
    try {
      const connectionStatus = await this.testService.checkTestConnection();
      
      return {
        status: 'success',
        data: connectionStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Test connection check failed', error);
      return {
        status: 'error',
        message: 'Failed to check test connection',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('status')
  @Public()
  async getTestStatus() {
    try {
      const [connectionStatus, testStats, testConfig] = await Promise.all([
        this.testService.checkTestConnection(),
        this.testService.getTestStats(),
        this.testService.getTestConfiguration(),
      ]);

      return {
        status: 'success',
        data: {
          connection: connectionStatus,
          stats: testStats,
          configuration: {
            enabled: testConfig.enabled,
            testNumber: testConfig.testNumber,
            phoneNumberId: testConfig.phoneNumberId,
            maxMessages: testConfig.maxMessages,
            sessionTimeoutMinutes: Math.floor(testConfig.sessionTimeout / 60),
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get test status', error);
      return {
        status: 'error',
        message: 'Failed to retrieve test status',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('send-message')
  @UseGuards(JwtAuthGuard)
  async sendTestMessage(
    @Body() body: { to: string; message: string; customerName?: string },
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Test message request from user ${user.email}: ${body.message} to ${body.to}`);

      const result = await this.testService.sendTestMessage({
        to: body.to,
        message: body.message,
        customerName: body.customerName,
      });

      return {
        status: result.success ? 'success' : 'error',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Test message sending failed', error);
      return {
        status: 'error',
        message: 'Failed to send test message',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('simulate-webhook')
  @UseGuards(JwtAuthGuard)
  async simulateIncomingMessage(
    @Body() body: { from: string; message: string; customerName?: string },
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Webhook simulation from user ${user.email}: ${body.message} from ${body.from}`);

      const result = await this.testService.simulateIncomingMessage({
        to: body.from, // 'to' in service means the customer phone
        message: body.message,
        customerName: body.customerName,
      });

      return {
        status: result.success ? 'success' : 'error',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Webhook simulation failed', error);
      return {
        status: 'error',
        message: 'Failed to simulate webhook',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  async getTestSession(@Query('phone') phone: string) {
    try {
      if (!phone) {
        return {
          status: 'error',
          message: 'Phone number parameter is required',
          timestamp: new Date().toISOString(),
        };
      }

      const sessionStatus = await this.testService.getTestSession(phone);

      return {
        status: 'success',
        data: sessionStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get test session', error);
      return {
        status: 'error',
        message: 'Failed to retrieve test session',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuard)
  async cleanupTestSessions(@CurrentUser() user: User) {
    try {
      await this.testService.cleanupExpiredSessions();
      
      this.logger.log(`Test session cleanup triggered by user ${user.email}`);

      return {
        status: 'success',
        message: 'Test sessions cleaned up successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Test session cleanup failed', error);
      return {
        status: 'error',
        message: 'Failed to cleanup test sessions',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('instructions')
  @Public()
  async getTestInstructions() {
    try {
      const testConfig = await this.testService.getTestConfiguration();
      
      const instructions = {
        overview: 'Test your WhatsApp AI system using Meta\'s official test number',
        testNumber: testConfig.testNumber,
        steps: [
          {
            step: 1,
            title: 'Verify Connection',
            description: 'Check that the system can connect to WhatsApp Business API',
            action: 'Click "Check Connection" button below',
          },
          {
            step: 2,
            title: 'Start Test Session',
            description: 'Initialize a new test session',
            action: 'Click "Start Test Session" to begin testing',
          },
          {
            step: 3,
            title: 'Send Test Message',
            description: `Open WhatsApp on your phone and send a message to ${testConfig.testNumber}`,
            action: `Message: ${testConfig.testNumber}`,
          },
          {
            step: 4,
            title: 'Monitor Response',
            description: 'Watch the real-time monitor for AI processing and response',
            action: 'Check the message monitor panel for live updates',
          },
          {
            step: 5,
            title: 'Verify AI Response',
            description: 'You should receive an AI-generated response on your WhatsApp',
            action: 'Check your WhatsApp for the automated response',
          },
          {
            step: 6,
            title: 'View Conversation',
            description: 'See the full conversation in your dashboard',
            action: 'Navigate to Conversations to see the test chat',
          },
        ],
        tips: [
          'The AI will use your configured knowledge base for responses',
          'Test messages are limited to 50 per session',
          'Each test session expires after 1 hour',
          'You can test different types of customer queries',
          'The system processes messages just like real customer interactions',
        ],
        troubleshooting: [
          {
            issue: 'No response received',
            solution: 'Check connection status and verify your WhatsApp number is correct',
          },
          {
            issue: 'AI response seems generic',
            solution: 'Upload knowledge base documents for more specific responses',
          },
          {
            issue: 'Test session expired',
            solution: 'Start a new test session - they automatically expire after 1 hour',
          },
        ],
      };

      return {
        status: 'success',
        data: instructions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get test instructions', error);
      return {
        status: 'error',
        message: 'Failed to load test instructions',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}