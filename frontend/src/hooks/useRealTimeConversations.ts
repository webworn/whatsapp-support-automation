import { useState, useEffect } from 'react';
import { conversationsApi } from '@/lib/api';
import { websocketService, WebSocketEvent } from '@/lib/websocket';

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  aiEnabled: boolean;
  status: 'active' | 'archived';
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  lastMessage?: {
    content: string;
    senderType: 'customer' | 'ai' | 'agent';
    timestamp: string;
  };
}

interface ConversationStats {
  total: number;
  active: number;
  archived: number;
  totalMessages: number;
}

export const useRealTimeConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    websocketService.connect();
    websocketService.onMessage(handleWebSocketEvent);

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list();
      setConversations(response.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await conversationsApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleWebSocketEvent = (event: WebSocketEvent) => {
    switch (event.type) {
      case 'new_message':
        handleNewMessage(event.data);
        break;
      case 'conversation_updated':
        handleConversationUpdate(event.data);
        break;
      case 'ai_status_changed':
        handleAIStatusChange(event.data);
        break;
    }
  };

  const handleNewMessage = (data: any) => {
    const { message, conversation } = data;
    
    // Update the conversation with new message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id
          ? {
              ...conv,
              lastMessageAt: message.timestamp,
              messageCount: conv.messageCount + 1,
              lastMessage: {
                content: message.content,
                senderType: message.senderType,
                timestamp: message.timestamp,
              }
            }
          : conv
      )
    );

    // Update stats
    setStats(prev => prev ? {
      ...prev,
      totalMessages: prev.totalMessages + 1,
    } : null);

    // Show notification for new customer messages
    if (message.senderType === 'customer') {
      showNotification(`New message from ${conversation.customerName || conversation.customerPhone}`, message.content);
    }
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  };

  const handleAIStatusChange = (data: { conversationId: string; aiEnabled: boolean }) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === data.conversationId 
          ? { ...conv, aiEnabled: data.aiEnabled }
          : conv
      )
    );
  };

  const toggleAI = async (conversationId: string) => {
    try {
      await conversationsApi.toggleAI(conversationId);
      
      // Optimistically update the UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, aiEnabled: !conv.aiEnabled }
            : conv
        )
      );

      // Simulate WebSocket event for real-time effect
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        websocketService.simulateAIToggle(conversationId, !conversation.aiEnabled);
      }
    } catch (err) {
      console.error('Failed to toggle AI:', err);
      setError('Failed to toggle AI');
    }
  };

  const showNotification = (title: string, body: string) => {
    // Check if notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body.length > 100 ? body.substring(0, 100) + '...' : body,
        icon: '/favicon.ico',
        tag: 'whatsapp-ai-message',
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    conversations,
    stats,
    loading,
    error,
    toggleAI,
    refreshConversations: fetchConversations,
    refreshStats: fetchStats,
    requestNotificationPermission,
  };
};