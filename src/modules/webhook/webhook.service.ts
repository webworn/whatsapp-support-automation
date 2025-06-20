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

    // Log webhook for debugging
    await this.logWebhook('whatsapp', rawPayload, true, true);

    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const { messages, statuses, contacts } = change.value;

            // Process incoming messages
            if (messages) {
              for (const message of messages) {
                const processed = await this.processIncomingMessage(message, contacts);
                if (processed) {
                  processedMessages.push(processed);
                }
              }
            }

            // Process message status updates
            if (statuses) {
              await this.processMessageStatuses(statuses);
            }
          }
        }
      }

      this.logger.log(`Processed ${processedMessages.length} messages from webhook`);
      return processedMessages;

    } catch (error) {
      this.logger.error('Error processing webhook', error);
      await this.logWebhook('whatsapp', rawPayload, true, false, error.message);
      throw error;
    }
  }

  private async processIncomingMessage(
    message: WhatsAppMessageDto, 
    contacts?: Array<{ profile: { name: string }; wa_id: string }>
  ): Promise<ProcessedMessageDto | null> {
    try {
      const customerPhone = message.from;
      const customerName = contacts?.find(c => c.wa_id === customerPhone)?.profile?.name;

      // Get message content based on type
      const { content, messageType } = this.extractMessageContent(message);

      if (!content) {
        this.logger.warn(`Unsupported message type: ${message.type}`);
        return null;
      }

      // Find the user who owns this WhatsApp phone number
      const userId = await this.getUserByWhatsAppPhone(customerPhone);
      
      if (!userId) {
        this.logger.warn(`No user configured for WhatsApp phone: ${customerPhone}`);
        return null; // Skip processing if no user is configured for this number
      }

      // Find or create conversation
      let conversation = await this.conversationService.findConversationByPhone(userId, customerPhone);
      
      if (!conversation) {
        conversation = await this.conversationService.createConversation(userId, {
          customerPhone,
          customerName,
          aiEnabled: true,
        });
      }

      // Create message record
      const messageRecord = await this.messageService.createMessage(userId, {
        conversationId: conversation.id,
        content,
        senderType: 'customer',
        messageType: messageType as 'text' | 'image' | 'document' | 'audio',
        whatsappMessageId: message.id,
      });

      this.logger.log(`Message processed: ${message.id} from ${customerPhone}`);

      // Generate AI response if conversation has AI enabled
      if (conversation.aiEnabled) {
        setImmediate(() => {
          this.generateAiResponse(userId, conversation.id, customerPhone, content, customerName);
        });
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

  private async processMessageStatuses(statuses: WhatsAppStatusDto[]): Promise<void> {
    for (const status of statuses) {
      // Log status updates for monitoring
      this.logger.log(`Message ${status.id} status: ${status.status} for ${status.recipient_id}`);
      
      // Here you could update message delivery status in database
      // For now, we'll just log it
    }
  }

  private async getUserByWhatsAppPhone(customerPhone: string): Promise<string | null> {
    // In multi-tenant SAAS, we need to determine which user owns/handles this customer
    // This could be done via:
    // 1. WhatsApp Business Phone Number mapping (preferred)
    // 2. Customer assignment rules
    // 3. Round-robin or load balancing
    
    // For now, we'll look for users who have configured their WhatsApp phone number
    // and either find exact match or use fallback logic
    
    // Option 1: Try to find user by their configured WhatsApp number
    // (In production, you'd match customer calls to business WhatsApp number)
    let user = await this.prisma.user.findFirst({
      where: { 
        whatsappPhoneNumber: { not: null },
        isEmailVerified: true, // Only active users
      },
      orderBy: { lastLoginAt: 'desc' }, // Prefer recently active users
    });

    // Option 2: If no specific mapping, find the primary/default user
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

    this.logger.log(`Routing customer ${customerPhone} to user ${user.email} (${user.businessName})`);
    return user.id;
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
    error?: string
  ): Promise<void> {
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
    } catch (logError) {
      this.logger.error('Failed to log webhook', logError);
    }
  }

  async getWebhookLogs(limit: number = 50) {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getWebhookStats() {
    const [total, processed, failed, recent] = await Promise.all([
      this.prisma.webhookLog.count(),
      this.prisma.webhookLog.count({ where: { processed: true } }),
      this.prisma.webhookLog.count({ where: { processed: false } }),
      this.prisma.webhookLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      total,
      processed,
      failed,
      recent,
      successRate: total > 0 ? Math.round((processed / total) * 100) : 0,
    };
  }

  private async generateAiResponse(
    userId: string,
    conversationId: string,
    customerPhone: string,
    customerMessage: string,
    customerName?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Generating AI response for conversation ${conversationId}`);

      // Get conversation history for context (last 10 messages)
      const recentMessages = await this.messageService.findMessages(userId, {
        conversationId,
        limit: '10',
        offset: '0',
        sortOrder: 'desc'
      });
      
      // Get user info for business context
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { businessName: true },
      });

      // Search knowledge base for relevant documents
      const relevantDocs = await this.documentService.getRelevantDocuments(
        userId, 
        customerMessage, 
        3 // Get top 3 relevant documents
      );

      this.logger.log(`Found ${relevantDocs.length} relevant documents for customer query`);

      // Prepare conversation context including both customer and AI messages
      const messages = recentMessages.messages
        .reverse() // Chronological order
        .map(msg => ({
          role: msg.senderType === 'customer' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));

      // Generate AI response with knowledge base context
      const aiResponse = await this.llmService.generateResponse({
        messages,
        businessName: user?.businessName,
        customerName,
        knowledgeBase: relevantDocs,
        userQuery: customerMessage,
      });

      // Save AI response to database
      const aiMessageRecord = await this.messageService.createMessage(userId, {
        conversationId,
        content: aiResponse.content,
        senderType: 'ai',
        messageType: 'text',
        aiModelUsed: aiResponse.model,
        processingTimeMs: aiResponse.processingTimeMs,
      });

      this.logger.log(`AI response generated and saved for conversation ${conversationId} (${aiResponse.processingTimeMs}ms)`);

      // Send AI response back to WhatsApp customer
      try {
        const sendResult = await this.whatsappService.sendTextMessage(customerPhone, aiResponse.content);
        
        if (sendResult.status === 'sent') {
          this.logger.log(`AI response sent via WhatsApp: ${sendResult.messageId} for message ${aiMessageRecord.id}`);
        } else {
          this.logger.error(`Failed to send AI response via WhatsApp: ${sendResult.error}`);
        }
      } catch (sendError) {
        this.logger.error(`Error sending AI response via WhatsApp`, sendError);
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
}