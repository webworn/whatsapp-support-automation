import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateUserDto, CreateConversationDto, CreateMessageDto, UpdateConversationDto } from './dto/conversation.dto';
import { User, Conversation, Message } from '@prisma/client';
import { normalizePhoneNumber } from '../../shared/utils/phone.util';

@Injectable()
export class ConversationRepository {
  private readonly logger = new Logger(ConversationRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  // User operations
  async findOrCreateUser(createUserDto: CreateUserDto): Promise<User> {
    const normalizedPhone = normalizePhoneNumber(createUserDto.phoneNumber);

    try {
      // Try to find existing user
      const existingUser = await this.prismaService.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      });

      if (existingUser) {
        // Update user info if provided
        if (createUserDto.name || createUserDto.language || createUserDto.metadata) {
          return await this.prismaService.user.update({
            where: { id: existingUser.id },
            data: {
              name: createUserDto.name || existingUser.name,
              language: createUserDto.language || existingUser.language,
              metadata: createUserDto.metadata || existingUser.metadata,
              updatedAt: new Date(),
            },
          });
        }
        return existingUser;
      }

      // Create new user
      return await this.prismaService.user.create({
        data: {
          phoneNumber: normalizedPhone,
          name: createUserDto.name,
          language: createUserDto.language || 'en',
          metadata: createUserDto.metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find or create user for ${normalizedPhone}`, error);
      throw error;
    }
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    try {
      return await this.prismaService.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by phone ${normalizedPhone}`, error);
      return null;
    }
  }

  async updateUser(userId: number, updates: Partial<CreateUserDto>): Promise<User> {
    try {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}`, error);
      throw error;
    }
  }

  // Conversation operations
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const normalizedPhone = normalizePhoneNumber(createConversationDto.phoneNumber);

    try {
      // Find or create user
      const user = await this.findOrCreateUser({ phoneNumber: normalizedPhone });

      return await this.prismaService.conversation.create({
        data: {
          userId: user.id,
          sessionId: createConversationDto.sessionId,
          language: createConversationDto.language || user.language,
          metadata: createConversationDto.metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create conversation for ${normalizedPhone}`, error);
      throw error;
    }
  }

  async findConversationBySessionId(sessionId: string): Promise<(Conversation & { user: User }) | null> {
    try {
      return await this.prismaService.conversation.findUnique({
        where: { sessionId },
        include: { user: true },
      });
    } catch (error) {
      this.logger.error(`Failed to find conversation by session ${sessionId}`, error);
      return null;
    }
  }

  async findActiveConversationByPhone(phoneNumber: string): Promise<(Conversation & { user: User }) | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    try {
      return await this.prismaService.conversation.findFirst({
        where: {
          user: { phoneNumber: normalizedPhone },
          status: 'active',
        },
        include: { user: true },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to find active conversation for ${normalizedPhone}`, error);
      return null;
    }
  }

  async updateConversation(conversationId: number, updateDto: UpdateConversationDto): Promise<Conversation> {
    try {
      const updateData: any = {
        ...updateDto,
        updatedAt: new Date(),
      };

      // Set completedAt if status is completed
      if (updateDto.status === 'completed' || updateDto.status === 'escalated') {
        updateData.completedAt = new Date();
      }

      return await this.prismaService.conversation.update({
        where: { id: conversationId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update conversation ${conversationId}`, error);
      throw error;
    }
  }

  async findConversationsByUser(userId: number, limit: number = 10): Promise<Conversation[]> {
    try {
      return await this.prismaService.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Failed to find conversations for user ${userId}`, error);
      return [];
    }
  }

  // Message operations
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      return await this.prismaService.message.create({
        data: createMessageDto,
      });
    } catch (error) {
      this.logger.error(`Failed to create message for conversation ${createMessageDto.conversationId}`, error);
      throw error;
    }
  }

  async findMessagesByConversation(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      return await this.prismaService.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error(`Failed to find messages for conversation ${conversationId}`, error);
      return [];
    }
  }

  async updateMessageDeliveryStatus(messageId: number, status: string, deliveredAt?: Date): Promise<Message> {
    try {
      return await this.prismaService.message.update({
        where: { id: messageId },
        data: {
          deliveryStatus: status,
          deliveredAt: deliveredAt || (status === 'delivered' ? new Date() : undefined),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update message delivery status ${messageId}`, error);
      throw error;
    }
  }

  async findMessageByMsg91Id(msg91MessageId: string): Promise<Message | null> {
    try {
      return await this.prismaService.message.findUnique({
        where: { msg91MessageId },
      });
    } catch (error) {
      this.logger.error(`Failed to find message by MSG91 ID ${msg91MessageId}`, error);
      return null;
    }
  }

  // Analytics and stats
  async getConversationStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        totalConversations,
        activeConversations,
        completedConversations,
        escalatedConversations,
        totalMessages,
        llmStats,
        resolutionTimes,
        satisfactionScores,
      ] = await Promise.all([
        // Total conversations
        this.prismaService.conversation.count({
          where: { createdAt: { gte: startDate } },
        }),
        
        // Active conversations
        this.prismaService.conversation.count({
          where: {
            status: 'active',
            createdAt: { gte: startDate },
          },
        }),
        
        // Completed conversations
        this.prismaService.conversation.count({
          where: {
            status: 'completed',
            createdAt: { gte: startDate },
          },
        }),
        
        // Escalated conversations
        this.prismaService.conversation.count({
          where: {
            status: 'escalated',
            createdAt: { gte: startDate },
          },
        }),
        
        // Total messages
        this.prismaService.message.count({
          where: { createdAt: { gte: startDate } },
        }),
        
        // LLM stats
        this.prismaService.message.aggregate({
          where: {
            isFromLlm: true,
            createdAt: { gte: startDate },
          },
          _count: { id: true },
          _sum: { llmCost: true },
        }),
        
        // Resolution times
        this.prismaService.conversation.aggregate({
          where: {
            resolutionTime: { not: null },
            createdAt: { gte: startDate },
          },
          _avg: { resolutionTime: true },
        }),
        
        // Satisfaction scores
        this.prismaService.conversation.aggregate({
          where: {
            satisfactionScore: { not: null },
            createdAt: { gte: startDate },
          },
          _avg: { satisfactionScore: true },
        }),
      ]);

      return {
        totalConversations,
        activeConversations,
        completedConversations,
        escalatedConversations,
        averageResolutionTime: resolutionTimes._avg.resolutionTime || 0,
        averageSatisfactionScore: satisfactionScores._avg.satisfactionScore || 0,
        totalMessages,
        llmMessages: llmStats._count.id || 0,
        totalLlmCost: llmStats._sum.llmCost || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get conversation stats', error);
      return null;
    }
  }

  async getUserConversationHistory(
    phoneNumber: string,
    limit: number = 10
  ): Promise<(Conversation & { messages: Message[] })[]> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    try {
      return await this.prismaService.conversation.findMany({
        where: {
          user: { phoneNumber: normalizedPhone },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Last 5 messages per conversation
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Failed to get conversation history for ${normalizedPhone}`, error);
      return [];
    }
  }

  async getMessageHistory(conversationId: number, limit: number = 50): Promise<Message[]> {
    try {
      return await this.prismaService.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Failed to get message history for conversation ${conversationId}`, error);
      return [];
    }
  }

  async cleanupOldData(daysToKeep: number = 90): Promise<{ deletedConversations: number; deletedMessages: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Delete old completed conversations and their messages
      const deletedConversations = await this.prismaService.conversation.deleteMany({
        where: {
          status: { in: ['completed', 'escalated'] },
          completedAt: { lt: cutoffDate },
        },
      });

      // Messages are deleted automatically due to cascade delete
      const deletedMessages = await this.prismaService.message.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          conversation: null, // Only orphaned messages
        },
      });

      this.logger.log(`Cleaned up ${deletedConversations.count} conversations and ${deletedMessages.count} messages`);

      return {
        deletedConversations: deletedConversations.count,
        deletedMessages: deletedMessages.count,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old data', error);
      return { deletedConversations: 0, deletedMessages: 0 };
    }
  }
}