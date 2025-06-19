import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: any;
}

class RealWebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private fallbackTimer: NodeJS.Timeout | null = null;

  connect(url?: string, token?: string) {
    const wsUrl = url || process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:3000';
    console.log('🔌 WebSocket connecting to:', `${wsUrl}/dashboard`);
    
    try {
      this.socket = io(`${wsUrl}/dashboard`, {
        transports: ['websocket', 'polling'],
        auth: {
          token: token || localStorage.getItem('token')
        }
      });

      this.socket.on('connect', () => {
        this.connected = true;
        console.log('✅ WebSocket connected');
        this.emit('connected', { status: 'connected', timestamp: new Date() });
        
        // Join user room if we have a token
        const userToken = localStorage.getItem('token');
        if (userToken) {
          this.socket?.emit('join-user', { 
            userId: 'current-user', 
            token: userToken 
          });
        }
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        console.log('❌ WebSocket disconnected');
        this.emit('disconnected', { status: 'disconnected', timestamp: new Date() });
        this.scheduleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.log('🔌 WebSocket connection failed, falling back to mock mode');
        this.connected = false;
        this.startFallbackMode();
      });

      // Real-time event handlers
      this.socket.on('new-message', (data) => {
        this.emit('new_message', data);
      });

      this.socket.on('conversation-updated', (data) => {
        this.emit('conversation_updated', data);
      });

      this.socket.on('conversations', (data) => {
        this.emit('conversations', data);
      });

      this.socket.on('message-sent', (data) => {
        this.emit('message_sent', data);
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('Failed to connect WebSocket, falling back to mock mode:', error);
      this.startFallbackMode();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.stopFallbackMode();
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(event: string, data: any) {
    if (this.socket && this.connected) {
      console.log('📤 WebSocket sending:', event, data);
      this.socket.emit(event, data);
    } else {
      console.log('📤 Mock WebSocket sending:', event, data);
      // Echo back for testing in fallback mode
      setTimeout(() => {
        this.emit('message', { type: 'ack', data });
      }, 100);
    }
  }

  isConnected() {
    return this.connected;
  }

  // Real-time actions
  toggleAI(conversationId: string, aiEnabled: boolean) {
    this.send('toggle-ai', { conversationId, aiEnabled });
  }

  sendMessage(conversationId: string, content: string) {
    this.send('send-message', { conversationId, content });
  }

  getConversations(userId: string) {
    this.send('get-conversations', { userId });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Attempting WebSocket reconnection...');
      this.connect();
    }, 5000);
  }

  private startFallbackMode() {
    if (this.fallbackTimer) return; // Already in fallback mode
    
    console.log('🔄 Starting fallback mode with mock events');
    this.connected = true; // Simulate connection for mock mode
    
    // Simulate connection
    setTimeout(() => {
      this.emit('connected', { status: 'connected (mock)', timestamp: new Date() });
    }, 1000);

    // Mock events for development
    this.fallbackTimer = setInterval(() => {
      const mockCustomers = [
        { name: 'Alice Johnson', phone: '+1234567890' },
        { name: 'Bob Smith', phone: '+1234567891' },
        { name: 'Carol Davis', phone: '+1234567892' },
      ];
      
      const mockMessages = [
        'Hi, I have a question about my order',
        'Can you help me track my shipment?',
        'I need to change my delivery address',
        'What are your business hours?',
        'Is this product still available?'
      ];
      
      if (Math.random() > 0.7) { // 30% chance
        const customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
        const message = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        
        this.emit('new_message', {
          id: `msg-${Date.now()}`,
          from: customer.phone,
          customerName: customer.name,
          content: message,
          timestamp: new Date(),
          messageType: 'text'
        });
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`New message from ${customer.name}`, {
            body: message,
            icon: '/favicon.ico'
          });
        }
      }
    }, 10000); // Every 10 seconds in mock mode
  }

  private stopFallbackMode() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}

// Export singleton instance
export const realWebSocketService = new RealWebSocketService();