import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/database/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import { MessageService } from '../conversation/message.service';
import { LlmService } from '../llm/llm.service';
import { DocumentService } from '../document/document.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { 
  WhatsAppWebhookDto, 
  WhatsAppMessageDto,
  WhatsAppStatusDto,
  ProcessedMessageDto 
} from './dto/webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly llmService: LlmService,
    private readonly documentService: DocumentService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string> {
    const verifyToken = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully');
      return challenge;
    } else {
      this.logger.error('Webhook verification failed', { mode, token });
      throw new BadRequestException('Webhook verification failed');
    }
  }

  async validateSignature(payload: string, signature: string): Promise<boolean> {
    const webhookSecret = this.configService.get<string>('WHATSAPP_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn('No webhook secret configured, skipping signature validation');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
    }

    return isValid;
  }

  async processWebhook(webhookData: WhatsAppWebhookDto, rawPayload: string): Promise<ProcessedMessageDto[]> {
    const processedMessages: ProcessedMessageDto[] = [];
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Processing webhook ${webhookId} with ${webhookData.entry?.length || 0} entries`);

    // Enhanced webhook logging
    await this.logWebhook('whatsapp', rawPayload, true, true, null, webhookId);

    try {
      // Check if test mode is enabled for enhanced logging
      const testConfig = this.configService.get('whatsapp.testing');
      const isTestMode = testConfig?.enabled;

      for (const entry of webhookData.entry) {
        this.logger.log(`Processing entry ${entry.id} with ${entry.changes?.length || 0} changes`);
        
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const { messages, statuses, contacts } = change.value;

            // Enhanced debugging for test mode
            if (isTestMode) {
              this.logger.log(`Webhook ${webhookId} - Messages: ${messages?.length || 0}, Statuses: ${statuses?.length || 0}, Contacts: ${contacts?.length || 0}`);
              
              if (messages) {
                for (const msg of messages) {
                  this.logger.log(`Test mode - Incoming message: ${msg.id} from ${msg.from} type: ${msg.type}`);
                }
              }
            }

            // Process incoming messages
            if (messages) {
              for (const message of messages) {
                const processed = await this.processIncomingMessage(message, contacts, webhookId);
                if (processed) {
                  processedMessages.push(processed);
                }
              }
            }

            // Process message status updates
            if (statuses) {
              await this.processMessageStatuses(statuses, webhookId);
            }
          } else {
            this.logger.log(`Webhook ${webhookId} - Skipping change field: ${change.field}`);
          }
        }
      }

      this.logger.log(`Webhook ${webhookId} processed ${processedMessages.length} messages successfully`);
      await this.logWebhook('whatsapp', rawPayload, true, true, null, webhookId);
      return processedMessages;

    } catch (error) {
      this.logger.error(`Webhook ${webhookId} processing failed`, error);
      await this.logWebhook('whatsapp', rawPayload, true, false, error.message, webhookId);
      throw error;
    }
  }

  private async processIncomingMessage(
    message: WhatsAppMessageDto, 
    contacts?: Array<{ profile: { name: string }; wa_id: string }>,
    webhookId?: string
  ): Promise<ProcessedMessageDto | null> {
    try {
      const customerPhone = message.from;
      const customerName = contacts?.find(c => c.wa_id === customerPhone)?.profile?.name;
      const logPrefix = webhookId ? `[${webhookId}]` : '';

      this.logger.log(`${logPrefix} Processing message ${message.id} from ${customerPhone} (${customerName || 'Unknown'})`);

      // Get message content based on type
      const { content, messageType } = this.extractMessageContent(message);

      if (!content) {
        this.logger.warn(`${logPrefix} Unsupported message type: ${message.type} for message ${message.id}`);
        return null;
      }

      this.logger.log(`${logPrefix} Message content extracted: type=${messageType}, length=${content.length}`);

      // Find the user who owns this WhatsApp phone number
      const userId = await this.getUserByWhatsAppPhone(customerPhone);
      
      if (!userId) {
        this.logger.error(`${logPrefix} No user configured for WhatsApp phone: ${customerPhone} - Message ${message.id} will be dropped`);
        return null; // Skip processing if no user is configured for this number
      }

      this.logger.log(`${logPrefix} Message ${message.id} routed to user ID: ${userId}`);

      // Find or create conversation
      let conversation = await this.conversationService.findConversationByPhone(userId, customerPhone);
      
      if (!conversation) {
        this.logger.log(`${logPrefix} Creating new conversation for ${customerPhone}`);
        conversation = await this.conversationService.createConversation(userId, {
          customerPhone,
          customerName,
          aiEnabled: true,
        });
        this.logger.log(`${logPrefix} Conversation created with ID: ${conversation.id}`);
      } else {
        this.logger.log(`${logPrefix} Using existing conversation ID: ${conversation.id}`);
      }

      // Create message record
      const messageRecord = await this.messageService.createMessage(userId, {
        conversationId: conversation.id,
        content,
        senderType: 'customer',
        messageType: messageType as 'text' | 'image' | 'document' | 'audio',
        whatsappMessageId: message.id,
      });

      this.logger.log(`${logPrefix} Message record created: ${messageRecord.id} for WhatsApp message ${message.id}`);

      // Generate AI response if conversation has AI enabled
      if (conversation.aiEnabled) {
        this.logger.log(`${logPrefix} Triggering AI response generation for conversation ${conversation.id}`);
        setImmediate(() => {
          this.generateAiResponse(userId, conversation.id, customerPhone, content, customerName, webhookId);
        });
      } else {
        this.logger.log(`${logPrefix} AI disabled for conversation ${conversation.id} - skipping AI response`);
      }

      return {
        id: messageRecord.id,
        conversationId: conversation.id,
        from: customerPhone,
        content,
        messageType,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        whatsappMessageId: message.id,
        customerName,
      };

    } catch (error) {
      this.logger.error(`Error processing message ${message.id}`, error);
      return null;
    }
  }

  private extractMessageContent(message: WhatsAppMessageDto): { content: string; messageType: string } {
    switch (message.type) {
      case 'text':
        return {
          content: message.text?.body || '',
          messageType: 'text',
        };

      case 'image':
        return {
          content: message.image?.caption || '[Image]',
          messageType: 'image',
        };

      case 'document':
        return {
          content: message.document?.caption || `[Document: ${message.document?.filename || 'Unknown'}]`,
          messageType: 'document',
        };

      case 'audio':
        return {
          content: '[Audio Message]',
          messageType: 'audio',
        };

      case 'button':
        return {
          content: message.button?.text || message.button?.payload || '[Button Response]',
          messageType: 'text',
        };

      case 'interactive':
        const interactive = message.interactive;
        if (interactive?.button_reply) {
          return {
            content: interactive.button_reply.title,
            messageType: 'text',
          };
        }
        if (interactive?.list_reply) {
          return {
            content: interactive.list_reply.title,
            messageType: 'text',
          };
        }
        return {
          content: '[Interactive Message]',
          messageType: 'text',
        };

      default:
        return {
          content: `[Unsupported message type: ${message.type}]`,
          messageType: 'text',
        };
    }
  }

  private async processMessageStatuses(statuses: WhatsAppStatusDto[], webhookId?: string): Promise<void> {
    const logPrefix = webhookId ? `[${webhookId}]` : '';
    
    for (const status of statuses) {
      this.logger.log(`${logPrefix} Message ${status.id} status: ${status.status} for ${status.recipient_id}`);
      
      try {
        // Find the message by WhatsApp message ID
        const message = await this.prisma.message.findUnique({
          where: { whatsappMessageId: status.id },
        });

        if (message) {
          // Update the message delivery status
          await this.prisma.message.update({
            where: { id: message.id },
            data: { deliveryStatus: status.status },
          });

          // Create a delivery update record for tracking history (if table exists)
          try {
            await this.prisma.messageDeliveryUpdate.create({
              data: {
                messageId: message.id,
                whatsappMessageId: status.id,
                status: status.status,
                recipientId: status.recipient_id,
                timestamp: new Date(parseInt(status.timestamp) * 1000),
              },
            });
          } catch (deliveryUpdateError) {
            // Silently ignore if messageDeliveryUpdate table doesn't exist
            this.logger.debug(`${logPrefix} Delivery update tracking skipped (table may not exist)`);
          }

          this.logger.log(`Updated delivery status for message ${message.id}: ${status.status}`);
        } else {
          this.logger.warn(`Message not found for WhatsApp ID: ${status.id}`);
        }
      } catch (error) {
        this.logger.error(`Failed to update delivery status for message ${status.id}`, error);
      }
    }
  }

  private async getUserByWhatsAppPhone(customerPhone: string): Promise<string | null> {
    // Enhanced user routing for test scenarios and production
    this.logger.log(`Finding user to handle customer: ${customerPhone}`);
    
    // Check if this is a test scenario (Meta test number)
    const testConfig = this.configService.get('whatsapp.testing');
    const isTestMode = testConfig?.enabled;
    const testNumber = testConfig?.testNumber || '+15556485637';
    
    // For test scenarios, prioritize test user
    if (isTestMode && this.isTestScenario(customerPhone, testNumber)) {
      this.logger.log(`Test scenario detected - routing to test user`);
      
      // Look for dedicated test user first
      let testUser = await this.prisma.user.findFirst({
        where: { 
          OR: [
            { email: 'test@whatsapp-ai.com' },
            { email: 'test@example.com' },
            { whatsappPhoneNumber: testNumber }
          ],
          isEmailVerified: true,
        },
        orderBy: { lastLoginAt: 'desc' },
      });

      if (testUser) {
        this.logger.log(`Routing test message to test user: ${testUser.email}`);
        return testUser.id;
      }

      this.logger.warn('No test user found, falling back to default user for test scenario');
    }

    // Production routing logic
    // Option 1: Try to find user by their configured WhatsApp number
    let user = await this.prisma.user.findFirst({
      where: { 
        whatsappPhoneNumber: { not: null },
        isEmailVerified: true,
      },
      orderBy: { lastLoginAt: 'desc' }, // Prefer recently active users
    });

    // Option 2: Customer assignment based on business rules
    if (!user) {
      // Look for users with active conversations to maintain continuity
      const existingConversation = await this.prisma.conversation.findFirst({
        where: { 
          customerPhone,
          user: { isEmailVerified: true }
        },
        include: { user: true },
        orderBy: { updatedAt: 'desc' },
      });

      if (existingConversation) {
        this.logger.log(`Found existing conversation - routing to previous user: ${existingConversation.user.email}`);
        return existingConversation.user.id;
      }
    }

    // Option 3: Default fallback - find the primary/default user
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { isEmailVerified: true },
        orderBy: { createdAt: 'asc' }, // Use first registered user as default
      });
    }

    if (!user) {
      this.logger.error(`No verified users found to handle customer ${customerPhone}`);
      return null;
    }

    this.logger.log(`Routing customer ${customerPhone} to user ${user.email} (${user.businessName || 'Unknown Business'})`);
    return user.id;
  }

  private isTestScenario(customerPhone: string, testNumber: string): boolean {
    // Check if this is related to test scenarios
    // This could be incoming to test number or from test number
    return customerPhone === testNumber || 
           customerPhone.includes('555648') || // Meta test number pattern
           customerPhone.includes('15556485637'); // Full test number
  }

  private async getOrCreateDemoUser(): Promise<string> {
    // Keep this method for backward compatibility and testing
    // But it should not be used in production webhook processing
    
    let user = await this.prisma.user.findFirst({
      where: { email: 'demo@whatsapp-ai.com' },
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('demo123456', 12);
      
      user = await this.prisma.user.create({
        data: {
          email: 'demo@whatsapp-ai.com',
          passwordHash,
          businessName: 'Demo Business (WhatsApp)',
          whatsappPhoneNumber: '+1234567890',
          isEmailVerified: true,
        },
      });

      this.logger.log('Created demo user for testing purposes');
    }

    return user.id;
  }

  private async logWebhook(
    source: string, 
    payload: string, 
    isValid: boolean, 
    processed: boolean,
    error?: string,
    webhookId?: string
  ): Promise<void> {
    try {
      // Log to console for now since webhookLog table may not exist
      const logPrefix = webhookId ? `[${webhookId}]` : '';
      this.logger.log(`${logPrefix} Webhook ${source}: ${processed ? 'processed' : 'failed'} ${error ? `(${error})` : ''}`);
      
      // Optionally try to log to database if table exists
      try {
        await this.prisma.webhookLog.create({
          data: {
            source,
            payload: payload.length > 10000 ? payload.substring(0, 10000) + '...' : payload,
            isValid,
            processed,
            error,
          },
        });
      } catch (dbError) {
        // Silently ignore database logging errors - table may not exist
        this.logger.debug('Webhook database logging skipped (table may not exist)');
      }
    } catch (logError) {
      this.logger.error('Failed to log webhook', logError);
    }
  }

  async getWebhookLogs(userId?: string, limit: number = 50) {
    try {
      // For now, return mock data based on recent messages since we don't have webhookLog table
      const recentMessages = await this.prisma.message.findMany({
        where: userId ? { conversation: { userId } } : undefined,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          conversation: {
            select: {
              customerPhone: true,
              customerName: true,
            }
          }
        },
      });

      return {
        logs: recentMessages.map(msg => ({
          id: msg.id,
          source: 'whatsapp-business',
          payload: JSON.stringify({
            from: msg.conversation.customerPhone,
            content: msg.content,
            type: msg.messageType,
          }),
          isValid: true,
          processed: true,
          error: null,
          createdAt: msg.createdAt.toISOString(),
        }))
      };
    } catch (error) {
      this.logger.error('Failed to get webhook logs', error);
      return { logs: [] };
    }
  }

  async getWebhookStats(userId?: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [totalMessages, todayMessages, failedMessages] = await Promise.all([
        this.prisma.message.count({
          where: userId ? { conversation: { userId } } : undefined,
        }),
        this.prisma.message.count({
          where: {
            ...(userId ? { conversation: { userId } } : {}),
            createdAt: { gte: today },
          },
        }),
        this.prisma.message.count({
          where: {
            ...(userId ? { conversation: { userId } } : {}),
            deliveryStatus: 'failed',
          },
        }),
      ]);

      const successRate = totalMessages > 0 
        ? Math.round(((totalMessages - failedMessages) / totalMessages) * 100)
        : 100;

      return {
        total: totalMessages,
        processed: totalMessages - failedMessages,
        failed: failedMessages,
        recent: todayMessages,
        successRate,
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats', error);
      return {
        total: 0,
        processed: 0,
        failed: 0,
        recent: 0,
        successRate: 100,
      };
    }
  }

  private async generateAiResponse(
    userId: string,
    conversationId: string,
    customerPhone: string,
    customerMessage: string,
    customerName?: string,
    webhookId?: string
  ): Promise<void> {
    const logPrefix = webhookId ? `[${webhookId}]` : '';
    
    try {
      this.logger.log(`${logPrefix} Generating AI response for conversation ${conversationId}`);

      // Get conversation history for context (last 10 messages)
      const recentMessages = await this.messageService.findMessages(userId, {
        conversationId,
        limit: '10',
        offset: '0',
        sortOrder: 'desc'
      });
      
      this.logger.log(`${logPrefix} Retrieved ${recentMessages.messages?.length || 0} recent messages for context`);
      
      // Get user info for business context
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { businessName: true },
      });

      this.logger.log(`${logPrefix} Business context: ${user?.businessName || 'Unknown Business'}`);

      // Search knowledge base for relevant documents
      const relevantDocs = await this.documentService.getRelevantDocuments(
        userId, 
        customerMessage, 
        3 // Get top 3 relevant documents
      );

      this.logger.log(`${logPrefix} Found ${relevantDocs.length} relevant documents for customer query`);

      // Prepare conversation context including both customer and AI messages
      const messages = recentMessages.messages
        .reverse() // Chronological order
        .map(msg => ({
          role: msg.senderType === 'customer' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));

      // Generate AI response with knowledge base context
      this.logger.log(`${logPrefix} Generating AI response with ${messages.length} context messages`);
      
      const aiResponse = await this.llmService.generateResponse({
        messages,
        businessName: user?.businessName,
        customerName,
        knowledgeBase: relevantDocs,
        userQuery: customerMessage,
      });

      this.logger.log(`${logPrefix} AI response generated using model: ${aiResponse.model} (${aiResponse.processingTimeMs}ms)`);

      // Save AI response to database
      const aiMessageRecord = await this.messageService.createMessage(userId, {
        conversationId,
        content: aiResponse.content,
        senderType: 'ai',
        messageType: 'text',
        aiModelUsed: aiResponse.model,
        processingTimeMs: aiResponse.processingTimeMs,
      });

      this.logger.log(`${logPrefix} AI message record created: ${aiMessageRecord.id}`);

      // Send AI response back to WhatsApp customer
      this.logger.log(`${logPrefix} Sending AI response to WhatsApp: ${customerPhone}`);
      
      try {
        const sendResult = await this.whatsappService.sendTextMessage(customerPhone, aiResponse.content);
        
        if (sendResult.status === 'sent') {
          // Update message with WhatsApp message ID and delivery status
          await this.messageService.updateMessage(userId, aiMessageRecord.id, {
            whatsappMessageId: sendResult.messageId,
            deliveryStatus: 'sent',
          });

          this.logger.log(`${logPrefix} AI response sent successfully: WhatsApp ID ${sendResult.messageId} for message ${aiMessageRecord.id}`);
        } else {
          // Update message with failed status
          await this.messageService.updateMessage(userId, aiMessageRecord.id, {
            deliveryStatus: 'failed',
          });

          this.logger.error(`${logPrefix} Failed to send AI response via WhatsApp: ${sendResult.error}`);
        }
      } catch (sendError) {
        this.logger.error(`${logPrefix} Error sending AI response via WhatsApp`, sendError);
        
        // Update message with failed status
        try {
          await this.messageService.updateMessage(userId, aiMessageRecord.id, {
            deliveryStatus: 'failed',
          });
        } catch (updateError) {
          this.logger.error(`Failed to update message delivery status`, updateError);
        }
      }

    } catch (error) {
      this.logger.error(`Failed to generate AI response for conversation ${conversationId}`, error);
      
      // Create fallback response in case of AI failure
      try {
        await this.messageService.createMessage(userId, {
          conversationId,
          content: `Thank you for your message! I'm experiencing some technical difficulties right now. A member of our team will get back to you shortly to assist you.`,
          senderType: 'ai',
          messageType: 'text',
          aiModelUsed: 'fallback',
        });
      } catch (fallbackError) {
        this.logger.error(`Failed to create fallback response`, fallbackError);
      }
    }
  }


  // Get webhook service health status
  async getHealthStatus() {
    try {
      // Check various health indicators
      const dbHealthy = await this.checkDatabaseHealth();
      const whatsappHealthy = await this.checkWhatsAppHealth();
      const aiHealthy = await this.checkAIHealth();

      return {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        whatsapp: whatsappHealthy ? 'healthy' : 'unhealthy',
        ai: aiHealthy ? 'healthy' : 'unhealthy',
        overall: dbHealthy && whatsappHealthy && aiHealthy ? 'healthy' : 'degraded',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        database: 'unknown',
        whatsapp: 'unknown',
        ai: 'unknown',
        overall: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkWhatsAppHealth(): Promise<boolean> {
    try {
      // Check if WhatsApp service is available
      const result = await this.whatsappService.testConnection();
      return result.status === 'connected';
    } catch {
      return false;
    }
  }

  private async checkAIHealth(): Promise<boolean> {
    try {
      // Check if AI service is available
      const result = await this.llmService.testConnection();
      return result.status === 'connected';
    } catch {
      return false;
    }
  }
}