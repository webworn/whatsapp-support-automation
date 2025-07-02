import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '@prisma/client';
import {
  CreateConversationDto,
  UpdateConversationDto,
  ConversationQueryDto,
  SendMessageDto,
} from './dto/conversation.dto';
import { MessageQueryDto, CreateMessageDto } from './dto/message.dto';

@Controller('api/conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  // Conversation Management
  @Post()
  async createConversation(
    @CurrentUser() user: User,
    @Body() createDto: CreateConversationDto,
  ) {
    const conversation = await this.conversationService.createConversation(user.id, createDto);
    return { conversation };
  }

  @Get()
  async getConversations(
    @CurrentUser() user: User,
    @Query() query: ConversationQueryDto,
  ) {
    const result = await this.conversationService.findAllConversations(user.id, query);
    return {
      conversations: result.conversations,
      total: result.total,
      limit: parseInt(query.limit || '20'),
      offset: parseInt(query.offset || '0'),
    };
  }

  @Get('stats')
  async getConversationStats(@CurrentUser() user: User) {
    const stats = await this.conversationService.getConversationStats(user.id);
    return { stats };
  }

  @Get(':id')
  async getConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    const conversation = await this.conversationService.findConversationById(user.id, conversationId);
    return { conversation };
  }

  @Put(':id')
  async updateConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
    @Body() updateDto: UpdateConversationDto,
  ) {
    const conversation = await this.conversationService.updateConversation(
      user.id,
      conversationId,
      updateDto,
    );
    return { conversation };
  }

  @Put(':id/toggle-ai')
  @HttpCode(HttpStatus.OK)
  async toggleAI(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    const conversation = await this.conversationService.toggleAI(user.id, conversationId);
    return { 
      conversation,
      message: `AI ${conversation.aiEnabled ? 'enabled' : 'disabled'} for conversation`
    };
  }

  @Put(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    const conversation = await this.conversationService.archiveConversation(user.id, conversationId);
    return { 
      conversation,
      message: 'Conversation archived successfully'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    await this.conversationService.deleteConversation(user.id, conversationId);
  }

  // Message Management
  @Get(':id/messages')
  async getMessages(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
    @Query() query: MessageQueryDto,
  ) {
    const queryWithConversation = { ...query, conversationId };
    const result = await this.messageService.findMessages(user.id, queryWithConversation);
    return {
      messages: result.messages,
      total: result.total,
      limit: parseInt(query.limit || '50'),
      offset: parseInt(query.offset || '0'),
    };
  }

  @Post(':id/messages')
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
    @Body() sendDto: SendMessageDto,
  ) {
    const createMessageDto: CreateMessageDto = {
      conversationId,
      content: sendDto.content,
      senderType: 'agent', // Manual message from user
      messageType: sendDto.messageType || 'text',
    };

    const message = await this.messageService.createMessage(user.id, createMessageDto);
    return { 
      message,
      success: true,
      note: 'Message sent manually (not via WhatsApp)'
    };
  }

  @Get(':id/messages/stats')
  async getMessageStats(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    const stats = await this.messageService.getMessageStats(user.id, conversationId);
    return { stats };
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
  ) {
    await this.messageService.deleteMessage(user.id, messageId);
  }

  // Search and Analytics
  @Get('search/messages')
  async searchMessages(
    @CurrentUser() user: User,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.messageService.searchMessages(
      user.id,
      searchTerm,
      parseInt(limit || '20'),
    );
    return { messages, searchTerm };
  }

  @Get('recent/messages')
  async getRecentMessages(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.messageService.getRecentMessages(
      user.id,
      parseInt(limit || '10'),
    );
    return { messages };
  }

  @Get('analytics/overview')
  async getAnalyticsOverview(@CurrentUser() user: User) {
    const [conversationStats, messageStats] = await Promise.all([
      this.conversationService.getConversationStats(user.id),
      this.messageService.getMessageStats(user.id),
    ]);

    return {
      conversations: conversationStats,
      messages: messageStats,
      summary: {
        totalConversations: conversationStats.total,
        totalMessages: messageStats.total,
        aiResponseRate: messageStats.total > 0 
          ? Math.round((messageStats.aiMessages / messageStats.total) * 100) 
          : 0,
        avgProcessingTime: messageStats.avgProcessingTimeMs,
      },
    };
  }

  @Get('analytics/real-time')
  async getRealTimeAnalytics(@CurrentUser() user: User) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayStats, yesterdayStats, weekStats, recentActivity] = await Promise.all([
      this.conversationService.getAnalyticsForPeriod(user.id, todayStart, now),
      this.conversationService.getAnalyticsForPeriod(user.id, yesterdayStart, todayStart),
      this.conversationService.getAnalyticsForPeriod(user.id, weekStart, now),
      this.messageService.getRecentActivity(user.id),
    ]);

    return {
      today: todayStats,
      yesterday: yesterdayStats,
      week: weekStats,
      recentActivity,
      trends: {
        messagesGrowth: yesterdayStats.totalMessages > 0 
          ? Math.round(((todayStats.totalMessages - yesterdayStats.totalMessages) / yesterdayStats.totalMessages) * 100)
          : 0,
        conversationsGrowth: yesterdayStats.totalConversations > 0
          ? Math.round(((todayStats.totalConversations - yesterdayStats.totalConversations) / yesterdayStats.totalConversations) * 100)
          : 0,
      },
    };
  }

  @Get('analytics/performance')
  async getPerformanceAnalytics(@CurrentUser() user: User) {
    const performance = await this.messageService.getPerformanceMetrics(user.id);
    return { performance };
  }
}