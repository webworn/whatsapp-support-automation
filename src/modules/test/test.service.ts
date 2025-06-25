import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/database/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { LlmService } from '../llm/llm.service';
import { ConversationService } from '../conversation/conversation.service';

export interface TestConnectionStatus {
  status: 'connected' | 'error' | 'disabled';
  testMode: boolean;
  testNumber: string;
  phoneNumberId: string;
  error?: string;
  timestamp: string;
}

export interface TestMessageRequest {
  to: string;
  message: string;
  customerName?: string;
}

export interface TestMessageResponse {
  success: boolean;
  messageId?: string;
  conversationId?: string;
  aiResponse?: string;
  error?: string;
  timestamp: string;
}

export interface TestSessionStatus {
  active: boolean;
  sessionId?: string;
  messageCount: number;
  maxMessages: number;
  expiresAt?: Date;
  testNumber: string;
}

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  private testSessions = new Map<string, any>(); // Simple in-memory session storage

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
    private readonly llmService: LlmService,
    private readonly conversationService: ConversationService,
  ) {}

  async getTestConfiguration() {
    const testConfig = this.configService.get('whatsapp.testing');
    return {
      enabled: testConfig?.enabled || false,
      testNumber: testConfig?.testNumber || '+15556485637',
      phoneNumberId: testConfig?.testPhoneNumberId || '665397593326012',
      businessAccountId: testConfig?.testBusinessAccountId || '1437200930610622',
      allowedTestNumbers: testConfig?.allowedTestNumbers || ['+15556485637'],
      maxMessages: testConfig?.maxTestMessages || 50,
      sessionTimeout: testConfig?.testSessionTimeout || 3600,
    };
  }

  async checkTestConnection(): Promise<TestConnectionStatus> {
    try {
      const testConfig = await this.getTestConfiguration();
      
      if (!testConfig.enabled) {
        return {
          status: 'disabled',
          testMode: false,
          testNumber: testConfig.testNumber,
          phoneNumberId: testConfig.phoneNumberId,
          timestamp: new Date().toISOString(),
        };
      }

      // Test the WhatsApp API connection
      const connectionTest = await this.whatsappService.testConnection();
      
      return {
        status: connectionTest.status === 'connected' ? 'connected' : 'error',
        testMode: testConfig.enabled,
        testNumber: testConfig.testNumber,
        phoneNumberId: testConfig.phoneNumberId,
        error: connectionTest.error,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Test connection check failed', error);
      return {
        status: 'error',
        testMode: false,
        testNumber: '+15556485637',
        phoneNumberId: '665397593326012',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendTestMessage(request: TestMessageRequest): Promise<TestMessageResponse> {
    try {
      const testConfig = await this.getTestConfiguration();
      
      if (!testConfig.enabled) {
        throw new BadRequestException('Test mode is not enabled');
      }

      // Validate test number
      if (!testConfig.allowedTestNumbers.includes(request.to)) {
        throw new BadRequestException(`Invalid test number. Allowed numbers: ${testConfig.allowedTestNumbers.join(', ')}`);
      }

      // Check or create test session
      const sessionStatus = await this.getTestSession(request.to);
      if (sessionStatus.messageCount >= sessionStatus.maxMessages) {
        throw new BadRequestException('Test session message limit reached');
      }

      this.logger.log(`Sending test message to ${request.to}: ${request.message}`);

      // Send the message via WhatsApp API
      const sendResult = await this.whatsappService.sendTextMessage(request.to, request.message);
      
      if (sendResult.status === 'sent') {
        // Update test session
        await this.updateTestSession(request.to);
        
        return {
          success: true,
          messageId: sendResult.messageId,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          error: sendResult.error || 'Failed to send test message',
          timestamp: new Date().toISOString(),
        };
      }

    } catch (error) {
      this.logger.error('Test message sending failed', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async simulateIncomingMessage(request: TestMessageRequest): Promise<TestMessageResponse> {
    try {
      const testConfig = await this.getTestConfiguration();
      
      if (!testConfig.enabled) {
        throw new BadRequestException('Test mode is not enabled');
      }

      this.logger.log(`Simulating incoming message from ${request.to}: ${request.message}`);

      // Get or create demo user for testing
      const userId = await this.getOrCreateTestUser();
      
      // Find or create conversation
      let conversation = await this.conversationService.findConversationByPhone(userId, request.to);
      
      if (!conversation) {
        conversation = await this.conversationService.createConversation(userId, {
          customerPhone: request.to,
          customerName: request.customerName || 'Test Customer',
          aiEnabled: true,
        });
      }

      // Simulate AI response generation
      try {
        // Get user info for business context
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { businessName: true },
        });

        // Get some sample knowledge base content for testing
        const knowledgeBase = await this.getSampleKnowledgeBase(userId);

        // Generate AI response
        const aiResponse = await this.llmService.generateResponse({
          messages: [
            { role: 'user', content: request.message }
          ],
          businessName: user?.businessName || 'Test Business',
          customerName: request.customerName || 'Test Customer',
          knowledgeBase,
          userQuery: request.message,
        });

        this.logger.log(`AI response generated: ${aiResponse.content}`);

        return {
          success: true,
          conversationId: conversation.id,
          aiResponse: aiResponse.content,
          timestamp: new Date().toISOString(),
        };

      } catch (aiError) {
        this.logger.error('AI response generation failed', aiError);
        return {
          success: true,
          conversationId: conversation.id,
          aiResponse: `Thank you for your test message! I'm experiencing some technical difficulties with AI processing right now, but I received your message: "${request.message}". A member of our team will get back to you shortly.`,
          timestamp: new Date().toISOString(),
        };
      }

    } catch (error) {
      this.logger.error('Incoming message simulation failed', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getTestSession(phoneNumber: string): Promise<TestSessionStatus> {
    const testConfig = await this.getTestConfiguration();
    const sessionKey = `test_session_${phoneNumber}`;
    
    let session = this.testSessions.get(sessionKey);
    
    if (!session || session.expiresAt < new Date()) {
      // Create new session
      session = {
        sessionId: `test_${Date.now()}`,
        messageCount: 0,
        expiresAt: new Date(Date.now() + testConfig.sessionTimeout * 1000),
        createdAt: new Date(),
      };
      this.testSessions.set(sessionKey, session);
    }

    return {
      active: true,
      sessionId: session.sessionId,
      messageCount: session.messageCount,
      maxMessages: testConfig.maxMessages,
      expiresAt: session.expiresAt,
      testNumber: phoneNumber,
    };
  }

  private async updateTestSession(phoneNumber: string): Promise<void> {
    const sessionKey = `test_session_${phoneNumber}`;
    const session = this.testSessions.get(sessionKey);
    
    if (session) {
      session.messageCount += 1;
      this.testSessions.set(sessionKey, session);
    }
  }

  private async getOrCreateTestUser(): Promise<string> {
    // Try to find existing test user
    let user = await this.prisma.user.findFirst({
      where: { email: 'test@whatsapp-ai.com' },
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('testpass123', 12);
      
      user = await this.prisma.user.create({
        data: {
          email: 'test@whatsapp-ai.com',
          passwordHash,
          businessName: 'WhatsApp AI Testing Business',
          whatsappPhoneNumber: '+15556485637',
          isEmailVerified: true,
        },
      });

      this.logger.log('Created test user for WhatsApp testing');
    }

    return user.id;
  }

  private async getSampleKnowledgeBase(userId: string): Promise<string[]> {
    try {
      // Get actual documents from knowledge base
      const documents = await this.prisma.document.findMany({
        where: { userId, status: 'ready' },
        take: 3,
        select: { content: true },
      });

      if (documents.length > 0) {
        return documents.map(doc => doc.content);
      }

      // Fallback to sample knowledge base for testing
      return [
        `Welcome to WhatsApp AI Testing Business! We provide automated customer support powered by AI. Our business hours are 9 AM to 6 PM, Monday through Friday. For urgent matters, please call our support line.`,
        
        `Our AI assistant can help you with:
        - Product information and pricing
        - Order status and tracking
        - Account management
        - Technical support
        - General inquiries
        
        If you need to speak with a human agent, just ask and we'll connect you during business hours.`,
        
        `Frequently Asked Questions:
        Q: How do I track my order?
        A: You can track your order by providing your order number.
        
        Q: What are your return policies?
        A: We offer 30-day returns on most products in original condition.
        
        Q: How can I update my account information?
        A: You can update your account through our website or by asking our AI assistant.`
      ];
    } catch (error) {
      this.logger.error('Failed to get knowledge base', error);
      return [
        'Welcome to our WhatsApp AI testing system! This is a sample response using default knowledge base content.'
      ];
    }
  }

  async getTestStats() {
    try {
      const testConfig = await this.getTestConfiguration();
      const activeSessions = Array.from(this.testSessions.values()).filter(
        session => session.expiresAt > new Date()
      );

      return {
        testMode: testConfig.enabled,
        testNumber: testConfig.testNumber,
        phoneNumberId: testConfig.phoneNumberId,
        activeSessions: activeSessions.length,
        totalMessagesSent: activeSessions.reduce((sum, session) => sum + session.messageCount, 0),
        maxMessagesPerSession: testConfig.maxMessages,
        sessionTimeoutMinutes: Math.floor(testConfig.sessionTimeout / 60),
        lastActivity: activeSessions.length > 0 
          ? Math.max(...activeSessions.map(s => s.createdAt.getTime()))
          : null,
      };
    } catch (error) {
      this.logger.error('Failed to get test stats', error);
      return {
        testMode: false,
        error: error.message,
      };
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    let cleanupCount = 0;

    for (const [key, session] of this.testSessions.entries()) {
      if (session.expiresAt < now) {
        this.testSessions.delete(key);
        cleanupCount++;
      }
    }

    if (cleanupCount > 0) {
      this.logger.log(`Cleaned up ${cleanupCount} expired test sessions`);
    }
  }
}