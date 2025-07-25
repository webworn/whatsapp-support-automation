import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateMessageDto, MessageQueryDto, MessageResponseDto } from './dto/message.dto';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, createDto: CreateMessageDto): Promise<Message> {
    // Verify conversation belongs to user
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: createDto.conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId: createDto.conversationId,
        content: createDto.content,
        senderType: createDto.senderType,
        messageType: createDto.messageType || 'text',
        whatsappMessageId: createDto.whatsappMessageId,
        aiModelUsed: createDto.aiModelUsed,
        processingTimeMs: createDto.processingTimeMs,
        metadata: createDto.metadata,
        timestamp: new Date(),
      },
    });

    // Update conversation's last message time
    await this.prisma.conversation.update({
      where: { id: createDto.conversationId },
      data: { lastMessageAt: new Date() },
    });

    this.logger.log(`Message created: ${message.id} in conversation ${createDto.conversationId}`);
    return message;
  }

  async findMessages(
    userId: string, 
    query: MessageQueryDto
  ): Promise<{ messages: MessageResponseDto[]; total: number }> {
    // Verify conversation belongs to user
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: query.conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    const where = {
      conversationId: query.conversationId,
      ...(query.senderType && { senderType: query.senderType }),
      ...(query.messageType && { messageType: query.messageType }),
      ...(query.search && { content: { contains: query.search } }),
      ...(query.fromDate && query.toDate && {
        timestamp: {
          gte: new Date(query.fromDate),
          lte: new Date(query.toDate),
        },
      }),
    };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { timestamp: query.sortOrder || 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({ where }),
    ]);

    const messageResponses: MessageResponseDto[] = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      senderType: msg.senderType as 'customer' | 'ai' | 'agent',
      messageType: msg.messageType,
      whatsappMessageId: msg.whatsappMessageId,
      aiModelUsed: msg.aiModelUsed,
      processingTimeMs: msg.processingTimeMs,
      timestamp: msg.timestamp,
      createdAt: msg.createdAt,
    }));

    return { messages: messageResponses, total };
  }

  async findMessageById(userId: string, messageId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({
      where: { 
        id: messageId,
        conversation: { userId },
      },
      include: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async getMessageStats(userId: string, conversationId?: string) {
    const where = conversationId 
      ? { conversationId, conversation: { userId } }
      : { conversation: { userId } };

    const [total, customerMessages, aiMessages, agentMessages] = await Promise.all([
      this.prisma.message.count({ where }),
      this.prisma.message.count({ where: { ...where, senderType: 'customer' } }),
      this.prisma.message.count({ where: { ...where, senderType: 'ai' } }),
      this.prisma.message.count({ where: { ...where, senderType: 'agent' } }),
    ]);

    // Get average processing time for AI messages
    const aiProcessingStats = await this.prisma.message.aggregate({
      where: { ...where, senderType: 'ai', processingTimeMs: { not: null } },
      _avg: { processingTimeMs: true },
      _max: { processingTimeMs: true },
      _min: { processingTimeMs: true },
    });

    return {
      total,
      customerMessages,
      aiMessages,
      agentMessages,
      avgProcessingTimeMs: aiProcessingStats._avg.processingTimeMs || 0,
      maxProcessingTimeMs: aiProcessingStats._max.processingTimeMs || 0,
      minProcessingTimeMs: aiProcessingStats._min.processingTimeMs || 0,
    };
  }

  async getRecentMessages(userId: string, limit: number = 10): Promise<MessageResponseDto[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversation: { userId } },
      include: { conversation: true },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      senderType: msg.senderType as 'customer' | 'ai' | 'agent',
      messageType: msg.messageType,
      whatsappMessageId: msg.whatsappMessageId,
      aiModelUsed: msg.aiModelUsed,
      processingTimeMs: msg.processingTimeMs,
      timestamp: msg.timestamp,
      createdAt: msg.createdAt,
    }));
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    await this.findMessageById(userId, messageId);

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    this.logger.log(`Message deleted: ${messageId}`);
  }

  async searchMessages(userId: string, searchTerm: string, limit: number = 20): Promise<MessageResponseDto[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        conversation: { userId },
        content: { contains: searchTerm },
      },
      include: { conversation: true },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      senderType: msg.senderType as 'customer' | 'ai' | 'agent',
      messageType: msg.messageType,
      whatsappMessageId: msg.whatsappMessageId,
      aiModelUsed: msg.aiModelUsed,
      processingTimeMs: msg.processingTimeMs,
      timestamp: msg.timestamp,
      createdAt: msg.createdAt,
    }));
  }

  async updateMessage(userId: string, messageId: string, updateData: {
    content?: string;
    whatsappMessageId?: string;
    deliveryStatus?: string;
    processingTimeMs?: number;
    aiModelUsed?: string;
    metadata?: string;
  }): Promise<Message> {
    await this.findMessageById(userId, messageId);

    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });

    this.logger.log(`Message updated: ${messageId} with fields: ${Object.keys(updateData).join(', ')}`);
    return message;
  }

  // Keep backward compatibility with the old signature
  async updateMessageContent(userId: string, messageId: string, content: string): Promise<Message> {
    return this.updateMessage(userId, messageId, { content });
  }

  async getMessageDeliveryStatus(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { 
        id: messageId,
        conversation: { userId },
      },
      include: {
        deliveryUpdates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return {
      messageId: message.id,
      whatsappMessageId: message.whatsappMessageId,
      currentStatus: message.deliveryStatus,
      deliveryHistory: message.deliveryUpdates.map(update => ({
        status: update.status,
        timestamp: update.timestamp,
        recipientId: update.recipientId,
        errorCode: update.errorCode,
        errorMessage: update.errorMessage,
      })),
    };
  }

  async getDeliveryStats(userId: string, conversationId?: string) {
    const where = conversationId 
      ? { conversationId, conversation: { userId } }
      : { conversation: { userId } };

    const [total, pending, sent, delivered, read, failed] = await Promise.all([
      this.prisma.message.count({ where: { ...where, senderType: { in: ['ai', 'agent'] } } }),
      this.prisma.message.count({ where: { ...where, deliveryStatus: 'pending', senderType: { in: ['ai', 'agent'] } } }),
      this.prisma.message.count({ where: { ...where, deliveryStatus: 'sent', senderType: { in: ['ai', 'agent'] } } }),
      this.prisma.message.count({ where: { ...where, deliveryStatus: 'delivered', senderType: { in: ['ai', 'agent'] } } }),
      this.prisma.message.count({ where: { ...where, deliveryStatus: 'read', senderType: { in: ['ai', 'agent'] } } }),
      this.prisma.message.count({ where: { ...where, deliveryStatus: 'failed', senderType: { in: ['ai', 'agent'] } } }),
    ]);

    const deliveryRate = total > 0 ? Math.round(((sent + delivered + read) / total) * 100) : 0;
    const readRate = total > 0 ? Math.round((read / total) * 100) : 0;

    return {
      total,
      pending,
      sent,
      delivered,
      read,
      failed,
      deliveryRate,
      readRate,
    };
  }

  async getRecentActivity(userId: string, limit: number = 20) {
    const recentMessages = await this.prisma.message.findMany({
      where: {
        conversation: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        conversation: {
          select: {
            id: true,
            customerName: true,
            customerPhone: true,
          },
        },
      },
    });

    return recentMessages.map(msg => ({
      id: msg.id,
      content: msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content,
      senderType: msg.senderType,
      timestamp: msg.createdAt,
      conversation: {
        id: msg.conversation.id,
        customerName: msg.conversation.customerName,
        customerPhone: msg.conversation.customerPhone,
      },
    }));
  }

  async getPerformanceMetrics(userId: string) {
    const [
      avgResponseTime,
      messageStats,
      aiPerformance,
      hourlyDistribution,
    ] = await Promise.all([
      this.prisma.message.aggregate({
        where: {
          conversation: { userId },
          senderType: 'ai',
          processingTimeMs: { not: null },
        },
        _avg: { processingTimeMs: true },
        _min: { processingTimeMs: true },
        _max: { processingTimeMs: true },
      }),
      this.prisma.message.groupBy({
        by: ['senderType'],
        where: {
          conversation: { userId },
        },
        _count: { id: true },
      }),
      this.prisma.message.groupBy({
        by: ['aiModelUsed'],
        where: {
          conversation: { userId },
          senderType: 'ai',
          aiModelUsed: { not: null },
        },
        _count: { id: true },
        _avg: { processingTimeMs: true },
      }),
      this.getHourlyMessageDistribution(userId),
    ]);

    return {
      responseTime: {
        average: avgResponseTime._avg.processingTimeMs || 0,
        min: avgResponseTime._min.processingTimeMs || 0,
        max: avgResponseTime._max.processingTimeMs || 0,
      },
      messageDistribution: messageStats.reduce((acc, stat) => {
        acc[stat.senderType] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      aiModels: aiPerformance.map(model => ({
        model: model.aiModelUsed,
        usage: model._count.id,
        avgResponseTime: model._avg.processingTimeMs,
      })),
      hourlyDistribution,
    };
  }

  private async getHourlyMessageDistribution(userId: string) {
    const messages = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count
      FROM "Message" m
      JOIN "Conversation" c ON m."conversationId" = c.id
      WHERE c."userId" = ${userId}
        AND m."createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `;

    // Create array with all 24 hours initialized to 0
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    // Fill in actual data
    (messages as any[]).forEach(row => {
      const hour = parseInt(row.hour);
      hourlyData[hour].count = parseInt(row.count);
    });

    return hourlyData;
  }
}