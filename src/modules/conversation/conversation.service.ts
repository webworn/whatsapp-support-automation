import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConversationRepository } from './conversation.repository';
import { SessionService } from '../../shared/session/session.service';
import { LlmService } from '../llm/llm.service';
import {
  ProcessMessageDto,
  CreateMessageDto,
  ConversationResponseDto,
  MessageResponseDto,
  ConversationStatsDto,
  MessageDirection,
  MessageType,
  ConversationStatus,
} from './dto/conversation.dto';
import { normalizePhoneNumber, validateMessageContent } from '../../shared/utils/validation.util';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly sessionService: SessionService,
    private readonly llmService: LlmService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processIncomingMessage(processMessageDto: ProcessMessageDto): Promise<{
    response?: string;
    messageId: number;
    conversationId: number;
  }> {
    const startTime = Date.now();
    const { phoneNumber, message, messageType = MessageType.TEXT, msg91MessageId, metadata } = processMessageDto;

    try {
      // Validate input
      validateMessageContent(message);
      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      this.logger.log(`Processing incoming message from ${normalizedPhone}`, {
        messageLength: message.length,
        messageType,
        msg91MessageId,
      });

      // Get or create session
      let session = await this.sessionService.getSessionByPhone(normalizedPhone);
      if (!session) {
        session = await this.sessionService.createSession({
          phoneNumber: normalizedPhone,
          context: {},
        });
      }

      // Get or create conversation
      let conversation = await this.conversationRepository.findConversationBySessionId(session.sessionId);
      if (!conversation) {
        conversation = await this.conversationRepository.createConversation({
          phoneNumber: normalizedPhone,
          sessionId: session.sessionId,
          language: session.context.language || 'en',
        });
      }

      // Store incoming message
      const incomingMessage = await this.conversationRepository.createMessage({
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        content: message,
        messageType,
        senderNumber: normalizedPhone,
        msg91MessageId,
        processingTime: Date.now() - startTime,
        metadata,
      });

      // Update session with message count and last activity
      await this.sessionService.updateSession(normalizedPhone, {
        messageCount: (session.messageCount || 0) + 1,
        context: {
          ...session.context,
          lastMessage: message,
          lastMessageTime: new Date().toISOString(),
        },
      });

      // Emit event for message processing
      this.eventEmitter.emit('message.received', {
        phoneNumber: normalizedPhone,
        message,
        conversationId: conversation.id,
        messageId: incomingMessage.id,
        sessionId: session.sessionId,
      });

      // Generate response using LLM
      const response = await this.generateResponse(conversation, session, message);

      if (response) {
        // Store outgoing message
        const outgoingMessage = await this.conversationRepository.createMessage({
          conversationId: conversation.id,
          direction: MessageDirection.OUTBOUND,
          content: response.response,
          messageType: MessageType.TEXT,
          recipientNumber: normalizedPhone,
          isFromLlm: true,
          llmModelUsed: response.modelUsed,
          llmCost: response.cost,
          processingTime: response.processingTime,
        });

        // Emit event for response generation
        this.eventEmitter.emit('message.generated', {
          phoneNumber: normalizedPhone,
          response: response.response,
          conversationId: conversation.id,
          messageId: outgoingMessage.id,
          cost: response.cost,
          model: response.modelUsed,
        });

        return {
          response: response.response,
          messageId: incomingMessage.id,
          conversationId: conversation.id,
        };
      }

      return {
        messageId: incomingMessage.id,
        conversationId: conversation.id,
      };
    } catch (error) {
      this.logger.error(`Failed to process message from ${phoneNumber}`, {
        error: error.message,
        phoneNumber,
        message: message.substring(0, 100),
      });

      // Emit error event
      this.eventEmitter.emit('message.error', {
        phoneNumber,
        message,
        error: error.message,
      });

      throw error;
    }
  }

  private async generateResponse(conversation: any, session: any, userMessage: string): Promise<any> {
    try {
      // Get recent message history for context
      const recentMessages = await this.conversationRepository.findMessagesByConversation(
        conversation.id,
        10 // Last 10 messages
      );

      // Prepare context for LLM
      const context = {
        ...session.context,
        userName: conversation.user.name,
        phoneNumber: conversation.user.phoneNumber,
        language: conversation.language,
        currentFlow: session.currentFlow,
        currentStep: session.currentStep,
        conversationId: conversation.id,
        recentMessages: recentMessages.reverse().map(msg => ({
          direction: msg.direction,
          content: msg.content,
          timestamp: msg.createdAt,
        })),
      };

      // Generate response using LLM service
      const response = await this.llmService.generateResponse({
        message: userMessage,
        context,
        phoneNumber: conversation.user.phoneNumber,
      });

      return response;
    } catch (error) {
      this.logger.error(`Failed to generate response for conversation ${conversation.id}`, error);
      
      // Return a fallback response
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or I can connect you with a human agent.",
        modelUsed: 'fallback',
        cost: 0,
        tokensUsed: 0,
        processingTime: 0,
        success: false,
        error: error.message,
      };
    }
  }

  async getConversation(sessionId: string): Promise<ConversationResponseDto | null> {
    try {
      const conversation = await this.conversationRepository.findConversationBySessionId(sessionId);
      
      if (!conversation) {
        return null;
      }

      // Get recent messages
      const messages = await this.conversationRepository.findMessagesByConversation(conversation.id, 20);
      const messageCount = await this.getMessageCount(conversation.id);

      return {
        id: conversation.id,
        user: {
          id: conversation.user.id,
          phoneNumber: conversation.user.phoneNumber,
          name: conversation.user.name,
          language: conversation.user.language,
        },
        sessionId: conversation.sessionId,
        status: conversation.status as ConversationStatus,
        currentFlow: conversation.currentFlow,
        currentStep: conversation.currentStep,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        completedAt: conversation.completedAt,
        messageCount,
        recentMessages: messages.reverse().map(this.toMessageResponseDto),
      };
    } catch (error) {
      this.logger.error(`Failed to get conversation for session ${sessionId}`, error);
      return null;
    }
  }

  async getConversationHistory(phoneNumber: string, limit: number = 10): Promise<ConversationResponseDto[]> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const conversations = await this.conversationRepository.getUserConversationHistory(normalizedPhone, limit);

      return conversations.map(conversation => ({
        id: conversation.id,
        user: {
          id: conversation.userId,
          phoneNumber: normalizedPhone,
          name: null,
          language: conversation.language,
        },
        sessionId: conversation.sessionId,
        status: conversation.status as ConversationStatus,
        currentFlow: conversation.currentFlow,
        currentStep: conversation.currentStep,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        completedAt: conversation.completedAt,
        messageCount: conversation.messages.length,
        recentMessages: conversation.messages.map(this.toMessageResponseDto),
      }));
    } catch (error) {
      this.logger.error(`Failed to get conversation history for ${phoneNumber}`, error);
      return [];
    }
  }

  async updateMessageDeliveryStatus(msg91MessageId: string, status: string): Promise<boolean> {
    try {
      const message = await this.conversationRepository.findMessageByMsg91Id(msg91MessageId);
      
      if (!message) {
        this.logger.warn(`Message not found for MSG91 ID: ${msg91MessageId}`);
        return false;
      }

      await this.conversationRepository.updateMessageDeliveryStatus(
        message.id,
        status,
        status === 'delivered' ? new Date() : undefined
      );

      // Emit delivery status event
      this.eventEmitter.emit('message.delivery.updated', {
        messageId: message.id,
        msg91MessageId,
        status,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to update delivery status for ${msg91MessageId}`, error);
      return false;
    }
  }

  async escalateConversation(sessionId: string, reason: string): Promise<boolean> {
    try {
      const conversation = await this.conversationRepository.findConversationBySessionId(sessionId);
      
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Update conversation status to escalated
      await this.conversationRepository.updateConversation(conversation.id, {
        status: ConversationStatus.ESCALATED,
        escalationReason: reason,
      });

      // End the session since human will take over
      await this.sessionService.endSession(conversation.user.phoneNumber);

      // Emit escalation event
      this.eventEmitter.emit('conversation.escalated', {
        conversationId: conversation.id,
        phoneNumber: conversation.user.phoneNumber,
        reason,
        timestamp: new Date(),
      });

      this.logger.log(`Escalated conversation ${conversation.id}`, { reason });
      return true;
    } catch (error) {
      this.logger.error(`Failed to escalate conversation ${sessionId}`, error);
      return false;
    }
  }

  async completeConversation(sessionId: string, satisfactionScore?: number): Promise<boolean> {
    try {
      const conversation = await this.conversationRepository.findConversationBySessionId(sessionId);
      
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Calculate resolution time
      const resolutionTime = (Date.now() - conversation.createdAt.getTime()) / 1000;

      // Update conversation status to completed
      await this.conversationRepository.updateConversation(conversation.id, {
        status: ConversationStatus.COMPLETED,
        resolutionTime,
        satisfactionScore,
      });

      // End the session
      await this.sessionService.endSession(conversation.user.phoneNumber);

      // Emit completion event
      this.eventEmitter.emit('conversation.completed', {
        conversationId: conversation.id,
        phoneNumber: conversation.user.phoneNumber,
        resolutionTime,
        satisfactionScore,
        timestamp: new Date(),
      });

      this.logger.log(`Completed conversation ${conversation.id}`, {
        resolutionTime,
        satisfactionScore,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to complete conversation ${sessionId}`, error);
      return false;
    }
  }

  async getConversationStats(days: number = 30): Promise<ConversationStatsDto> {
    try {
      const stats = await this.conversationRepository.getConversationStats(days);
      return stats;
    } catch (error) {
      this.logger.error('Failed to get conversation stats', error);
      return {
        totalConversations: 0,
        activeConversations: 0,
        completedConversations: 0,
        escalatedConversations: 0,
        averageResolutionTime: 0,
        averageSatisfactionScore: 0,
        totalMessages: 0,
        llmMessages: 0,
        totalLlmCost: 0,
      };
    }
  }

  async cleanupOldConversations(daysToKeep: number = 90): Promise<void> {
    try {
      const result = await this.conversationRepository.cleanupOldData(daysToKeep);
      
      this.logger.log('Cleaned up old conversation data', {
        deletedConversations: result.deletedConversations,
        deletedMessages: result.deletedMessages,
        daysToKeep,
      });

      // Emit cleanup event
      this.eventEmitter.emit('conversations.cleaned', {
        deletedConversations: result.deletedConversations,
        deletedMessages: result.deletedMessages,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to cleanup old conversations', error);
    }
  }

  private async getMessageCount(conversationId: number): Promise<number> {
    try {
      const messages = await this.conversationRepository.findMessagesByConversation(conversationId);
      return messages.length;
    } catch (error) {
      return 0;
    }
  }

  private toMessageResponseDto(message: any): MessageResponseDto {
    return {
      id: message.id,
      direction: message.direction,
      messageType: message.messageType,
      content: message.content,
      deliveryStatus: message.deliveryStatus,
      isFromLlm: message.isFromLlm,
      llmModelUsed: message.llmModelUsed,
      llmCost: message.llmCost,
      processingTime: message.processingTime,
      createdAt: message.createdAt,
      deliveredAt: message.deliveredAt,
    };
  }
}