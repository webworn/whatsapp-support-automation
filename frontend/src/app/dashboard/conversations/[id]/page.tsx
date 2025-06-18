'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed unused Card imports
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  BotOff, 
  Phone, 
  User,
  Image,
  File,
  Mic,
  MoreHorizontal
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderType: 'customer' | 'business' | 'ai';
  messageType: 'text' | 'image' | 'document' | 'audio';
  timestamp: string;
  whatsappMessageId?: string;
}

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  aiEnabled: boolean;
  status: 'active' | 'archived';
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]); // Dependencies are correct for this use case

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await conversationsApi.get(conversationId);
      setConversation(response.data);
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.getMessages(conversationId);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await conversationsApi.sendMessage(conversationId, {
        content: messageContent,
        messageType: 'text',
      });

      // Add the new message to the list
      setMessages(prev => [...prev, response.data]);
      
      // Update conversation last message time
      if (conversation) {
        setConversation(prev => prev ? {
          ...prev,
          lastMessageAt: new Date().toISOString(),
          messageCount: prev.messageCount + 1,
        } : null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Restore the message in the input
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleToggleAI = async () => {
    if (!conversation) return;
    
    try {
      await conversationsApi.toggleAI(conversationId);
      setConversation(prev => prev ? {
        ...prev,
        aiEnabled: !prev.aiEnabled,
      } : null);
    } catch (err) {
      console.error('Failed to toggle AI:', err);
      setError('Failed to toggle AI');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'document': return <File className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Conversation not found</h2>
          <p className="text-gray-600 mt-2">This conversation may have been deleted or you don&apos;t have access to it.</p>
          <Button 
            onClick={() => router.push('/dashboard/conversations')}
            className="mt-4"
          >
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard/conversations')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {conversation.customerName || 'Unknown Customer'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-3 w-3" />
                  <span>{conversation.customerPhone}</span>
                  {conversation.status === 'archived' && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">Archived</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={conversation.aiEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleToggleAI}
              className="flex items-center gap-1"
            >
              {conversation.aiEnabled ? (
                <>
                  <Bot className="h-4 w-4" />
                  AI On
                </>
              ) : (
                <>
                  <BotOff className="h-4 w-4" />
                  AI Off
                </>
              )}
            </Button>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {formatDate(date)}
              </span>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-3">
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === 'customer' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'customer'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : message.senderType === 'ai'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {/* Message header for non-text messages */}
                    {message.messageType !== 'text' && (
                      <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                        {getMessageIcon(message.messageType)}
                        <span className="capitalize">{message.messageType}</span>
                      </div>
                    )}
                    
                    {/* Message content */}
                    <div className="text-sm">{message.content}</div>
                    
                    {/* Message footer */}
                    <div className="flex items-center justify-between mt-1 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        {message.senderType === 'ai' && <Bot className="h-3 w-3" />}
                        {message.senderType === 'business' && <User className="h-3 w-3" />}
                        <span className="capitalize">{message.senderType}</span>
                      </div>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bot className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-center">Start the conversation by sending a message below.</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="flex items-center gap-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </form>
        
        {conversation.aiEnabled && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI responses are enabled for this conversation
          </div>
        )}
      </div>
    </div>
  );
}