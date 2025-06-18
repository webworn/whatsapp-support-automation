import { Injectable, Logger } from '@nestjs/common';

// Mock database service that provides in-memory data
// This allows the backend to work without Prisma/database issues

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  businessName: string;
  whatsappPhoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockConversation {
  id: string;
  userId: string;
  customerPhone: string;
  customerName?: string;
  aiEnabled: boolean;
  status: 'active' | 'archived';
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  content: string;
  senderType: 'customer' | 'business' | 'ai';
  messageType: 'text' | 'image' | 'document' | 'audio';
  whatsappMessageId?: string;
  createdAt: string;
}

export interface MockWebhookLog {
  id: string;
  source: string;
  payload: string;
  isValid: boolean;
  processed: boolean;
  error?: string;
  createdAt: string;
}

@Injectable()
export class MockDatabaseService {
  private readonly logger = new Logger(MockDatabaseService.name);
  
  // In-memory data store
  private users: MockUser[] = [
    {
      id: 'demo-user-id-123',
      email: 'demo@whatsapp-ai.com',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNDhMo', // demo123456
      businessName: 'Demo Business (WhatsApp)',
      whatsappPhoneNumber: '+1234567890',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  private conversations: MockConversation[] = [
    {
      id: 'conv-1',
      userId: 'demo-user-id-123',
      customerPhone: '+1234567891',
      customerName: 'John Doe',
      aiEnabled: true,
      status: 'active',
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      messageCount: 8,
    },
    {
      id: 'conv-2',
      userId: 'demo-user-id-123',
      customerPhone: '+1234567892',
      customerName: 'Jane Smith',
      aiEnabled: false,
      status: 'active',
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      messageCount: 12,
    },
    {
      id: 'conv-3',
      userId: 'demo-user-id-123',
      customerPhone: '+1234567893',
      customerName: 'Mike Johnson',
      aiEnabled: true,
      status: 'archived',
      lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      messageCount: 5,
    }
  ];

  private messages: MockMessage[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      content: 'Hi, I need help with my order!',
      senderType: 'customer',
      messageType: 'text',
      whatsappMessageId: 'wa-msg-1',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      content: 'Hello! I\'d be happy to help you with your order. Can you please provide your order number?',
      senderType: 'ai',
      messageType: 'text',
      createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      content: 'My order number is ORD-12345',
      senderType: 'customer',
      messageType: 'text',
      whatsappMessageId: 'wa-msg-2',
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      content: 'Let me check the status of order ORD-12345 for you.',
      senderType: 'business',
      messageType: 'text',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    }
  ];

  private webhookLogs: MockWebhookLog[] = [
    {
      id: 'webhook-1',
      source: 'whatsapp',
      payload: '{"object":"whatsapp_business_account","entry":[{"id":"test","changes":[{"value":{"messaging_product":"whatsapp","messages":[{"from":"+1234567891","id":"test-msg","timestamp":"1703093700","type":"text","text":{"body":"Hello"}}]},"field":"messages"}]}]}',
      isValid: true,
      processed: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'webhook-2',
      source: 'whatsapp',
      payload: '{"object":"whatsapp_business_account","entry":[{"id":"test","changes":[{"value":{"messaging_product":"whatsapp","messages":[{"from":"+1234567892","id":"test-msg-2","timestamp":"1703093800","type":"text","text":{"body":"Hi there"}}]},"field":"messages"}]}]}',
      isValid: true,
      processed: true,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    }
  ];

  constructor() {
    this.logger.log('MockDatabaseService initialized with demo data');
  }

  // User methods
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockUser> {
    const user: MockUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.users[userIndex];
  }

  // Conversation methods
  async findConversationsByUserId(userId: string): Promise<MockConversation[]> {
    return this.conversations.filter(conv => conv.userId === userId);
  }

  async findConversationById(id: string): Promise<MockConversation | null> {
    return this.conversations.find(conv => conv.id === id) || null;
  }

  async findConversationByPhone(userId: string, customerPhone: string): Promise<MockConversation | null> {
    return this.conversations.find(conv => 
      conv.userId === userId && conv.customerPhone === customerPhone
    ) || null;
  }

  async createConversation(data: Omit<MockConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockConversation> {
    const conversation: MockConversation = {
      ...data,
      id: `conv-${Date.now()}`,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.push(conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<MockConversation>): Promise<MockConversation | null> {
    const convIndex = this.conversations.findIndex(conv => conv.id === id);
    if (convIndex === -1) return null;

    this.conversations[convIndex] = {
      ...this.conversations[convIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.conversations[convIndex];
  }

  async getConversationStats(userId: string) {
    const userConversations = this.conversations.filter(conv => conv.userId === userId);
    const totalMessages = userConversations.reduce((sum, conv) => sum + (conv.messageCount || 0), 0);
    
    return {
      total: userConversations.length,
      active: userConversations.filter(conv => conv.status === 'active').length,
      archived: userConversations.filter(conv => conv.status === 'archived').length,
      totalMessages,
    };
  }

  // Message methods
  async findMessagesByConversationId(conversationId: string): Promise<MockMessage[]> {
    return this.messages.filter(msg => msg.conversationId === conversationId);
  }

  async createMessage(data: Omit<MockMessage, 'id' | 'createdAt'>): Promise<MockMessage> {
    const message: MockMessage = {
      ...data,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(message);

    // Update conversation message count
    const convIndex = this.conversations.findIndex(conv => conv.id === data.conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].messageCount = (this.conversations[convIndex].messageCount || 0) + 1;
      this.conversations[convIndex].lastMessageAt = message.createdAt;
      this.conversations[convIndex].updatedAt = message.createdAt;
    }

    return message;
  }

  // Webhook methods
  async findWebhookLogs(limit: number = 50): Promise<MockWebhookLog[]> {
    return this.webhookLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createWebhookLog(data: Omit<MockWebhookLog, 'id' | 'createdAt'>): Promise<MockWebhookLog> {
    const log: MockWebhookLog = {
      ...data,
      id: `webhook-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.webhookLogs.push(log);
    return log;
  }

  async getWebhookStats() {
    const total = this.webhookLogs.length;
    const processed = this.webhookLogs.filter(log => log.processed).length;
    const failed = this.webhookLogs.filter(log => !log.processed).length;
    const recent = this.webhookLogs.filter(log => 
      new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return {
      total,
      processed,
      failed,
      recent,
      successRate: total > 0 ? Math.round((processed / total) * 100) : 0,
    };
  }

  // Analytics methods
  async getAnalyticsOverview(userId: string) {
    const userConversations = this.conversations.filter(conv => conv.userId === userId);
    const userMessages = this.messages.filter(msg => 
      userConversations.some(conv => conv.id === msg.conversationId)
    );

    const aiMessages = userMessages.filter(msg => msg.senderType === 'ai').length;
    const totalMessages = userMessages.length;

    return {
      aiResponseRate: totalMessages > 0 ? Math.round((aiMessages / totalMessages) * 100) : 0,
      averageResponseTime: 2.5, // Mock average response time in minutes
      totalConversations: userConversations.length,
      totalMessages,
    };
  }

  async searchMessages(userId: string, query: string, limit: number = 10): Promise<MockMessage[]> {
    const userConversations = this.conversations.filter(conv => conv.userId === userId);
    const conversationIds = userConversations.map(conv => conv.id);
    
    return this.messages
      .filter(msg => 
        conversationIds.includes(msg.conversationId) &&
        msg.content.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
  }

  async getRecentMessages(userId: string, limit: number = 10): Promise<MockMessage[]> {
    const userConversations = this.conversations.filter(conv => conv.userId === userId);
    const conversationIds = userConversations.map(conv => conv.id);
    
    return this.messages
      .filter(msg => conversationIds.includes(msg.conversationId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}