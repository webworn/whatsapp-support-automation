// Mock data for frontend testing when backend is unavailable
export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@example.com',
  businessName: 'Demo Business',
  whatsappPhoneNumber: '+1234567890',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockConversations = [
  {
    id: 'conv-1',
    customerPhone: '+1999555001',
    customerName: 'John Smith',
    aiEnabled: true,
    status: 'active' as const,
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    messageCount: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), // 2 days ago
    lastMessage: {
      content: 'Thanks for the quick response!',
      senderType: 'customer' as const,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
  },
  {
    id: 'conv-2',
    customerPhone: '+1999555002',
    customerName: 'Sarah Johnson',
    aiEnabled: false,
    status: 'active' as const,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    messageCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    lastMessage: {
      content: 'Can you help me with my order?',
      senderType: 'customer' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  },
  {
    id: 'conv-3',
    customerPhone: '+1999555003',
    customerName: 'Mike Wilson',
    aiEnabled: true,
    status: 'archived' as const,
    lastMessageAt: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(), // 7 days ago
    messageCount: 25,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(), // 10 days ago
    lastMessage: {
      content: 'Problem solved, thank you!',
      senderType: 'customer' as const,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    },
  },
];

export const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    content: 'Hi, I need help with my recent order.',
    senderType: 'customer' as const,
    messageType: 'text' as const,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    content: 'Hello! I\'d be happy to help you with your order. Could you please provide your order number?',
    senderType: 'ai' as const,
    messageType: 'text' as const,
    aiModelUsed: 'claude-haiku',
    processingTimeMs: 1250,
    timestamp: new Date(Date.now() - 44 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 44 * 60000).toISOString(),
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    content: 'Sure, my order number is #12345',
    senderType: 'customer' as const,
    messageType: 'text' as const,
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    content: 'Thanks for the quick response!',
    senderType: 'customer' as const,
    messageType: 'text' as const,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

export const mockStats = {
  total: 3,
  active: 2,
  closed: 0,
  archived: 1,
  aiEnabled: 2,
  aiDisabled: 1,
  totalMessages: 45,
};

export const mockDashboardStats = {
  totalConversations: 3,
  activeConversations: 2,
  totalMessages: 45,
  aiResponseRate: 75,
  averageResponseTime: 1.2,
  webhookStats: {
    total: 15,
    processed: 14,
    failed: 1,
    successRate: 93,
  },
};

export const mockWebhookLogs = [
  {
    id: 'log-1',
    source: 'whatsapp',
    payload: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
    isValid: true,
    processed: true,
    error: null,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'log-2',
    source: 'whatsapp',
    payload: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
    isValid: true,
    processed: true,
    error: null,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

// Mock API responses
export const mockApi = {
  auth: {
    login: async (email: string, password: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return {
        data: {
          user: mockUser,
          accessToken: 'mock-jwt-token-' + Date.now(),
        }
      };
    },
    register: async (email: string, password: string, businessName: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: { ...mockUser, email, businessName },
          accessToken: 'mock-jwt-token-' + Date.now(),
        }
      };
    },
    me: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { user: mockUser } };
    },
  },
  conversations: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { data: { conversations: mockConversations } };
    },
    getStats: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: mockStats };
    },
    get: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const conversation = mockConversations.find(c => c.id === id);
      if (!conversation) throw new Error('Conversation not found');
      return { data: conversation };
    },
    getMessages: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const messages = mockMessages.filter(m => m.conversationId === id);
      return { data: { messages } };
    },
    toggleAI: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { data: { success: true } };
    },
    getAnalytics: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      return { data: { aiResponseRate: 75, averageResponseTime: 1.2 } };
    },
  },
  webhooks: {
    getStats: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: { stats: mockDashboardStats.webhookStats } };
    },
    getLogs: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { data: { logs: mockWebhookLogs } };
    },
  },
};

export const USE_MOCK_DATA = process.env.NODE_ENV === 'development';