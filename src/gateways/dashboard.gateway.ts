import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { ConversationService } from '../modules/conversation/conversation.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'https://whatsapp-support-automation-production.up.railway.app'],
    credentials: true,
  },
  namespace: '/dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(private readonly conversationService: ConversationService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // In a real implementation, you'd verify the JWT token here
      // For now, we'll use a simple connection logging
      this.logger.log(`Client connected: ${client.id}`);
      
      // Simulate authentication - in production, extract from JWT
      const userId = 'demo-user-id'; // Would come from JWT token
      client.userId = userId;

      // Track user connections
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      // Join user-specific room
      await client.join(`user:${userId}`);
      
      // Send initial data
      this.sendInitialData(client, userId);
      
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage('join-user')
  async handleJoinUser(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string; token: string }
  ) {
    try {
      // In production, verify JWT token here
      client.userId = data.userId;
      await client.join(`user:${data.userId}`);
      
      this.sendInitialData(client, data.userId);
      
      client.emit('joined', { success: true, userId: data.userId });
    } catch (error) {
      client.emit('error', { message: 'Failed to join user room' });
    }
  }

  @SubscribeMessage('get-conversations')
  async handleGetConversations(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string }
  ) {
    try {
      const conversations = await this.conversationService.getUserConversations(data.userId);
      client.emit('conversations', conversations);
    } catch (error) {
      client.emit('error', { message: 'Failed to get conversations' });
    }
  }

  @SubscribeMessage('toggle-ai')
  async handleToggleAI(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; aiEnabled: boolean }
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      await this.conversationService.updateConversation(
        client.userId,
        data.conversationId,
        { aiEnabled: data.aiEnabled }
      );

      // Broadcast to all user connections
      this.server.to(`user:${client.userId}`).emit('conversation-updated', {
        conversationId: data.conversationId,
        aiEnabled: data.aiEnabled,
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to toggle AI' });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // In production, this would send via WhatsApp API
      this.logger.log(`Sending message to conversation ${data.conversationId}: ${data.content}`);
      
      // Broadcast message sent event
      this.server.to(`user:${client.userId}`).emit('message-sent', {
        conversationId: data.conversationId,
        content: data.content,
        timestamp: new Date(),
        senderType: 'business',
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // Public methods for broadcasting events from other services
  public broadcastNewMessage(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('new-message', message);
  }

  public broadcastConversationUpdate(userId: string, conversation: any) {
    this.server.to(`user:${userId}`).emit('conversation-updated', conversation);
  }

  private async sendInitialData(client: AuthenticatedSocket, userId: string) {
    try {
      // Send initial conversations
      const conversations = await this.conversationService.getUserConversations(userId);
      client.emit('conversations', conversations);

      // Send connection status
      client.emit('connection-status', { 
        connected: true, 
        userId,
        timestamp: new Date() 
      });

    } catch (error) {
      this.logger.error('Failed to send initial data:', error);
      client.emit('error', { message: 'Failed to load initial data' });
    }
  }
}