import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { 
  CreateConversationDto, 
  UpdateConversationDto, 
  ConversationQueryDto,
  ConversationResponseDto 
} from './dto/conversation.dto';
import { Conversation, Message } from '@prisma/client';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private prisma: PrismaService) {}

  async getUserConversations(
    userId: string,
    query?: ConversationQueryDto
  ): Promise<{ conversations: ConversationResponseDto[]; total: number; limit: number; offset: number }> {
    const { limit = 20, offset = 0, status, search } = query || {};

    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
        include: {
          _count: {
            select: { messages: true }
          }
        }
      }),
      this.prisma.conversation.count({ where })
    ]);

    const conversationDtos: ConversationResponseDto[] = conversations.map(conv => ({
      id: conv.id,
      customerPhone: conv.customerPhone,
      customerName: conv.customerName,
      status: conv.status as 'active' | 'closed' | 'archived',
      aiEnabled: conv.aiEnabled,
      lastMessageAt: conv.lastMessageAt,
      messageCount: (conv as any)._count?.messages || 0,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return {
      conversations: conversationDtos,
      total,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  async createConversation(
    userId: string, 
    createDto: CreateConversationDto
  ): Promise<Conversation> {
    // Check if conversation already exists for this customer
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        userId,
        customerPhone: createDto.customerPhone,
        status: { in: ['active', 'closed'] }, // Don't count archived conversations
      },
    });

    if (existingConversation) {
      // Reactivate if closed
      if (existingConversation.status === 'closed') {
        return this.prisma.conversation.update({
          where: { id: existingConversation.id },
          data: {
            status: 'active',
            lastMessageAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      return existingConversation;
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        customerPhone: createDto.customerPhone,
        customerName: createDto.customerName,
        aiEnabled: createDto.aiEnabled ?? true,
        status: 'active',
        lastMessageAt: new Date(),
      },
    });

    this.logger.log(`New conversation created: ${conversation.id} for ${createDto.customerPhone}`);
    return conversation;
  }

  async findAllConversations(
    userId: string, 
    query: ConversationQueryDto
  ): Promise<{ conversations: ConversationResponseDto[]; total: number }> {
    const limit = parseInt(query.limit || '20');
    const offset = parseInt(query.offset || '0');
    
    const where = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.customerPhone && { customerPhone: query.customerPhone }),
      ...(query.aiEnabled !== undefined && { aiEnabled: query.aiEnabled }),
      ...(query.search && {
        OR: [
          { customerName: { contains: query.search } },
          { customerPhone: { contains: query.search } },
        ],
      }),
    };

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1, // Get last message
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { [query.sortBy || 'lastMessageAt']: query.sortOrder || 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    const conversationResponses: ConversationResponseDto[] = conversations.map(conv => ({
      id: conv.id,
      customerPhone: conv.customerPhone,
      customerName: conv.customerName,
      status: conv.status,
      aiEnabled: conv.aiEnabled,
      lastMessageAt: conv.lastMessageAt,
      messageCount: conv._count.messages,
      lastMessage: conv.messages[0] ? {
        content: conv.messages[0].content,
        senderType: conv.messages[0].senderType,
        timestamp: conv.messages[0].timestamp,
      } : undefined,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return { conversations: conversationResponses, total };
  }

  async findConversationById(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async findConversationByPhone(userId: string, customerPhone: string): Promise<Conversation | null> {
    return this.prisma.conversation.findFirst({
      where: {
        userId,
        customerPhone,
        status: { in: ['active', 'closed'] },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async updateConversation(
    userId: string, 
    conversationId: string, 
    updateDto: UpdateConversationDto
  ): Promise<Conversation> {
    // Verify conversation belongs to user
    await this.findConversationById(userId, conversationId);

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Conversation updated: ${conversationId}`);
    return conversation;
  }

  async toggleAI(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.findConversationById(userId, conversationId);
    
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        aiEnabled: !conversation.aiEnabled,
        updatedAt: new Date(),
      },
    });
  }

  async archiveConversation(userId: string, conversationId: string): Promise<Conversation> {
    await this.findConversationById(userId, conversationId);

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'archived',
        updatedAt: new Date(),
      },
    });
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    await this.findConversationById(userId, conversationId);

    // This will cascade delete all messages due to onDelete: Cascade in schema
    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    this.logger.log(`Conversation deleted: ${conversationId}`);
  }

  async getConversationStats(userId: string) {
    const [total, active, closed, archived, aiEnabled] = await Promise.all([
      this.prisma.conversation.count({ where: { userId } }),
      this.prisma.conversation.count({ where: { userId, status: 'active' } }),
      this.prisma.conversation.count({ where: { userId, status: 'closed' } }),
      this.prisma.conversation.count({ where: { userId, status: 'archived' } }),
      this.prisma.conversation.count({ where: { userId, aiEnabled: true } }),
    ]);

    return {
      total,
      active,
      closed,
      archived,
      aiEnabled,
      aiDisabled: total - aiEnabled,
    };
  }

  async updateLastMessageTime(conversationId: string): Promise<void> {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  }
}