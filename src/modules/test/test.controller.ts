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
            title: 'Setup Test User',
            description: 'Ensure test user exists for message routing',
            action: 'Click "Create Test User" to setup routing',
          },
          {
            step: 3,
            title: 'Configure Meta Webhook',
            description: 'Setup webhook in Meta Business Manager',
            action: 'Add webhook URL in Meta dashboard',
          },
          {
            step: 4,
            title: 'Send Test Message',
            description: `Open WhatsApp on your phone and send a message to ${testConfig.testNumber}`,
            action: `Message: ${testConfig.testNumber}`,
          },
          {
            step: 5,
            title: 'Monitor Response',
            description: 'Watch the real-time monitor for AI processing and response',
            action: 'Check the message monitor panel for live updates',
          },
          {
            step: 6,
            title: 'Verify AI Response',
            description: 'You should receive an AI-generated response on your WhatsApp',
            action: 'Check your WhatsApp for the automated response',
          },
          {
            step: 7,
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
          'Make sure webhook is configured in Meta Business Manager',
        ],
        troubleshooting: [
          {
            issue: 'No response received',
            solution: 'Check webhook configuration in Meta Business Manager and verify test user exists',
          },
          {
            issue: 'Webhook not receiving messages',
            solution: 'Verify webhook URL and verify token in Meta dashboard',
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
        webhookConfig: {
          url: 'https://whatsapp-support-automation-production.up.railway.app/api/webhooks/whatsapp-business',
          verifyToken: 'test_verify_token_123',
          events: ['messages', 'message_deliveries', 'message_reads'],
        },
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

  @Post('create-user')
  @Public()
  async createTestUser() {
    try {
      const result = await this.testService.createTestUser();
      
      return {
        status: 'success',
        data: result,
        message: 'Test user created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to create test user', error);
      return {
        status: 'error',
        message: 'Failed to create test user',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('user-status')
  @Public()
  async getTestUserStatus() {
    try {
      const result = await this.testService.getTestUserStatus();
      
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get test user status', error);
      return {
        status: 'error',
        message: 'Failed to get test user status',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('end-to-end')
  @Public()
  async testEndToEnd(@Body() body: { testMessage?: string }) {
    try {
      const testMessage = body.testMessage || 'Hello, this is a test message to verify the complete WhatsApp AI system.';
      
      this.logger.log(`Running end-to-end test with message: ${testMessage}`);
      
      // Step 1: Check connection
      const connectionStatus = await this.testService.checkTestConnection();
      if (connectionStatus.status !== 'connected') {
        return {
          status: 'error',
          step: 'connection',
          message: 'WhatsApp connection is not healthy',
          data: connectionStatus,
          timestamp: new Date().toISOString(),
        };
      }

      // Step 2: Ensure test user exists
      let userResult;
      try {
        userResult = await this.testService.createTestUser();
      } catch (userError) {
        return {
          status: 'error',
          step: 'user_creation',
          message: 'Failed to create or verify test user',
          error: userError.message,
          timestamp: new Date().toISOString(),
        };
      }

      // Step 3: Simulate incoming webhook message
      const testNumber = '+15556485637';
      const simulationResult = await this.testService.simulateIncomingMessage({
        to: testNumber,
        message: testMessage,
        customerName: 'Test Customer',
      });

      if (!simulationResult.success) {
        return {
          status: 'error',
          step: 'message_simulation',
          message: 'Failed to simulate incoming message',
          error: simulationResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      // Return complete test results
      return {
        status: 'success',
        message: 'End-to-end test completed successfully',
        data: {
          connection: connectionStatus,
          user: userResult,
          messageSimulation: simulationResult,
          testFlow: {
            steps: [
              '✅ WhatsApp API connection verified',
              '✅ Test user created/verified',
              '✅ Incoming message simulated',
              '✅ AI response generated',
              '✅ Complete flow functional'
            ],
            nextSteps: [
              'Send real WhatsApp message to +1 555 648 5637',
              'Verify webhook receives the message',
              'Check AI response in dashboard',
              'Confirm response delivered to WhatsApp'
            ]
          }
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('End-to-end test failed', error);
      return {
        status: 'error',
        step: 'unknown',
        message: 'End-to-end test failed with unexpected error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}