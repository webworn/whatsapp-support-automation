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

      // Test the WhatsApp API connection with timeout
      let connectionTest;
      try {
        // Add timeout to prevent hanging
        connectionTest = await Promise.race([
          this.whatsappService.testConnection(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection test timeout after 10 seconds')), 10000)
          )
        ]);
      } catch (connectionError) {
        this.logger.error('WhatsApp API connection test failed', connectionError);
        return {
          status: 'error',
          testMode: testConfig.enabled,
          testNumber: testConfig.testNumber,
          phoneNumberId: testConfig.phoneNumberId,
          error: `WhatsApp API connection failed: ${connectionError.message}`,
          timestamp: new Date().toISOString(),
        };
      }
      
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
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message?.includes('config')) {
        errorMessage = 'Configuration error: Please check environment variables';
      } else if (error.message?.includes('network') || error.message?.includes('ENOTFOUND')) {
        errorMessage = 'Network error: Cannot reach WhatsApp API servers';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Timeout error: WhatsApp API is not responding';
      }
      
      return {
        status: 'error',
        testMode: false,
        testNumber: '+15556485637',
        phoneNumberId: '665397593326012',
        error: errorMessage,
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
        
        // Provide different fallback responses based on error type
        let fallbackResponse = `Thank you for your test message! I'm experiencing some technical difficulties with AI processing right now, but I received your message: "${request.message}". A member of our team will get back to you shortly.`;
        
        if (aiError.message?.includes('API key')) {
          fallbackResponse = `Thank you for your message! Our AI system is currently unavailable due to configuration issues. Please contact support for immediate assistance.`;
        } else if (aiError.message?.includes('timeout')) {
          fallbackResponse = `Thank you for your message! Our AI system is taking longer than usual to respond. We're working to resolve this issue.`;
        } else if (aiError.message?.includes('rate limit')) {
          fallbackResponse = `Thank you for your message! We're currently experiencing high volume. Your message is important to us and we'll respond as soon as possible.`;
        }
        
        return {
          success: true,
          conversationId: conversation.id,
          aiResponse: fallbackResponse,
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

  async createTestUser(): Promise<any> {
    try {
      // Check if test user already exists
      let testUser = await this.prisma.user.findFirst({
        where: { 
          OR: [
            { email: 'test@whatsapp-ai.com' },
            { email: 'test@example.com' }
          ]
        },
      });

      if (testUser) {
        // Update existing user to ensure proper configuration
        testUser = await this.prisma.user.update({
          where: { id: testUser.id },
          data: {
            whatsappPhoneNumber: '+15556485637',
            isEmailVerified: true,
            businessName: 'WhatsApp AI Testing Business',
            aiModelPreference: 'claude-haiku',
            lastLoginAt: new Date(),
          },
        });

        this.logger.log(`Updated existing test user: ${testUser.email}`);
        
        return {
          action: 'updated',
          user: {
            id: testUser.id,
            email: testUser.email,
            businessName: testUser.businessName,
            whatsappPhoneNumber: testUser.whatsappPhoneNumber,
            isEmailVerified: testUser.isEmailVerified,
            createdAt: testUser.createdAt,
          },
        };
      }

      // Create new test user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('testpass123', 12);
      
      testUser = await this.prisma.user.create({
        data: {
          email: 'test@whatsapp-ai.com',
          passwordHash,
          businessName: 'WhatsApp AI Testing Business',
          whatsappPhoneNumber: '+15556485637',
          aiModelPreference: 'claude-haiku',
          isEmailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      this.logger.log(`Created new test user: ${testUser.email}`);

      // Create some sample knowledge base content for testing
      try {
        await this.createSampleKnowledgeBase(testUser.id);
      } catch (kbError) {
        this.logger.warn('Failed to create sample knowledge base', kbError);
      }

      return {
        action: 'created',
        user: {
          id: testUser.id,
          email: testUser.email,
          businessName: testUser.businessName,
          whatsappPhoneNumber: testUser.whatsappPhoneNumber,
          isEmailVerified: testUser.isEmailVerified,
          createdAt: testUser.createdAt,
        },
        credentials: {
          email: 'test@whatsapp-ai.com',
          password: 'testpass123',
        },
      };

    } catch (error) {
      this.logger.error('Failed to create test user', error);
      
      // Enhanced error information for debugging
      if (error.code === 'P2002') {
        // Unique constraint violation - probably email already exists
        throw new Error('Test user already exists with a different configuration. Please check existing users.');
      }
      
      if (error.code === 'P2003') {
        // Foreign key constraint failure
        throw new Error('Database constraint error. Please ensure all required tables exist.');
      }
      
      if (error.message?.includes('connect')) {
        throw new Error('Database connection failed. Please check database availability.');
      }
      
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  }

  async getTestUserStatus(): Promise<any> {
    try {
      const testUsers = await this.prisma.user.findMany({
        where: { 
          OR: [
            { email: 'test@whatsapp-ai.com' },
            { email: 'test@example.com' }
          ]
        },
        select: {
          id: true,
          email: true,
          businessName: true,
          whatsappPhoneNumber: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              conversations: true,
              documents: true,
            },
          },
        },
      });

      const totalUsers = await this.prisma.user.count({
        where: { isEmailVerified: true },
      });

      return {
        testUsers,
        totalVerifiedUsers: totalUsers,
        hasTestUser: testUsers.length > 0,
        recommendedUser: testUsers.find(u => u.email === 'test@whatsapp-ai.com') || testUsers[0],
      };

    } catch (error) {
      this.logger.error('Failed to get test user status', error);
      throw new Error(`Failed to get test user status: ${error.message}`);
    }
  }

  private async createSampleKnowledgeBase(userId: string): Promise<void> {
    try {
      // Check if sample documents already exist
      const existingDocs = await this.prisma.document.count({
        where: { userId, category: 'sample' },
      });

      if (existingDocs > 0) {
        this.logger.log('Sample knowledge base already exists');
        return;
      }

      // Create sample documents for testing
      const sampleDocs = [
        {
          filename: 'business-info.txt',
          originalName: 'Business Information',
          fileType: 'txt',
          content: `Welcome to WhatsApp AI Testing Business!

Business Hours: Monday-Friday 9AM-6PM EST
Support Email: support@whatsapp-ai.com
Phone: +1-555-123-4567

Our Services:
- AI-powered customer support automation
- WhatsApp Business API integration
- Knowledge base management
- Real-time conversation monitoring
- Multi-language support

We specialize in helping businesses automate their customer support through intelligent WhatsApp integration.`,
          category: 'sample',
        },
        {
          filename: 'faq.txt',
          originalName: 'Frequently Asked Questions',
          fileType: 'txt',
          content: `Frequently Asked Questions

Q: How does the AI assistant work?
A: Our AI assistant uses advanced language models to understand customer queries and provide intelligent responses based on your knowledge base.

Q: Can I customize the AI responses?
A: Yes! You can upload your own documents to the knowledge base, and the AI will use that information to provide contextual responses.

Q: What types of messages are supported?
A: We support text messages, images, documents, and interactive button responses.

Q: How do I get started?
A: Simply send a message to our WhatsApp number and the AI will respond automatically using your business information.

Q: Is my data secure?
A: Yes, all conversations are encrypted and stored securely. We follow industry best practices for data protection.`,
          category: 'sample',
        },
        {
          filename: 'pricing.txt',
          originalName: 'Pricing Information',
          fileType: 'txt',
          content: `Pricing Plans

Starter Plan - $29/month
- Up to 500 messages per month
- Basic AI responses
- Email support
- 1 WhatsApp number

Professional Plan - $99/month
- Up to 2,000 messages per month
- Advanced AI with custom knowledge base
- Priority support
- 3 WhatsApp numbers
- Analytics dashboard

Enterprise Plan - $299/month
- Unlimited messages
- Custom AI training
- Dedicated support manager
- Multiple WhatsApp numbers
- Advanced analytics
- API access

All plans include:
- 24/7 AI responses
- Message history
- Real-time monitoring
- Mobile and web dashboard`,
          category: 'sample',
        },
      ];

      for (const doc of sampleDocs) {
        await this.prisma.document.create({
          data: {
            ...doc,
            userId,
            fileSize: doc.content.length,
            status: 'ready',
            uploadDate: new Date(),
          },
        });
      }

      this.logger.log(`Created ${sampleDocs.length} sample knowledge base documents`);

    } catch (error) {
      this.logger.error('Failed to create sample knowledge base', error);
      throw error;
    }
  }
}