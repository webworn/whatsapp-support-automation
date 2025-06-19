// Simulated real-time updates for the dashboard
import { mockMessages, mockConversations } from './mock-data';

export type WebSocketEvent = 
  | { type: 'new_message'; data: any }
  | { type: 'conversation_updated'; data: any }
  | { type: 'ai_status_changed'; data: { conversationId: string; aiEnabled: boolean } };

type EventHandler = (event: WebSocketEvent) => void;

class MockWebSocketService {
  private handlers: EventHandler[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  connect() {
    console.log('🔗 Connected to mock WebSocket service');
    
    // Simulate periodic updates
    this.intervalId = setInterval(() => {
      this.simulateRandomUpdate();
    }, 15000); // Every 15 seconds
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🔌 Disconnected from mock WebSocket service');
  }

  onMessage(handler: EventHandler) {
    this.handlers.push(handler);
  }

  removeHandler(handler: EventHandler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  private simulateRandomUpdate() {
    const updateTypes = ['new_message', 'conversation_updated'] as const;
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

    switch (randomType) {
      case 'new_message':
        this.simulateNewMessage();
        break;
      case 'conversation_updated':
        this.simulateConversationUpdate();
        break;
    }
  }

  private simulateNewMessage() {
    const conversations = mockConversations.filter(c => c.status === 'active');
    if (conversations.length === 0) return;

    const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: randomConversation.id,
      content: this.getRandomCustomerMessage(),
      senderType: 'customer' as const,
      messageType: 'text' as const,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.notifyHandlers({
      type: 'new_message',
      data: {
        message: newMessage,
        conversation: randomConversation,
      }
    });
  }

  private simulateConversationUpdate() {
    const conversations = mockConversations.filter(c => c.status === 'active');
    if (conversations.length === 0) return;

    const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
    
    this.notifyHandlers({
      type: 'conversation_updated',
      data: {
        ...randomConversation,
        lastMessageAt: new Date().toISOString(),
        messageCount: randomConversation.messageCount + 1,
      }
    });
  }

  private getRandomCustomerMessage(): string {
    const messages = [
      'Hi, I need help with my order',
      'Can you check my delivery status?',
      'Thank you for the quick response!',
      'I have a question about your products',
      'Is there a discount available?',
      'How can I track my shipment?',
      'The product quality is excellent!',
      'Can I return this item?',
      'What are your business hours?',
      'Do you offer international shipping?',
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private notifyHandlers(event: WebSocketEvent) {
    this.handlers.forEach(handler => handler(event));
  }

  // Simulate user actions
  simulateAIToggle(conversationId: string, aiEnabled: boolean) {
    this.notifyHandlers({
      type: 'ai_status_changed',
      data: { conversationId, aiEnabled }
    });
  }
}

// Singleton instance
export const websocketService = new MockWebSocketService();

// Hook for React components
export const useWebSocket = () => {
  return websocketService;
};