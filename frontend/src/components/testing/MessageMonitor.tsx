'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  User, 
  Bot, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Activity
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderType: 'customer' | 'ai' | 'agent';
  messageType: string;
  timestamp: string;
  deliveryStatus?: string;
  aiModelUsed?: string;
  processingTimeMs?: number;
}

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  status: string;
  lastMessageAt: string;
  messages: Message[];
}

interface MessageMonitorProps {
  testNumber?: string;
}

export default function MessageMonitor({ testNumber }: MessageMonitorProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchConversations();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchConversations, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, testNumber]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get conversations and filter for test number if specified
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        let filteredConversations = data.data.conversations || [];
        
        // Filter for test number conversations if testNumber is provided
        if (testNumber) {
          filteredConversations = filteredConversations.filter(
            (conv: Conversation) => conv.customerPhone === testNumber
          );
        }
        
        // Sort by most recent activity
        filteredConversations.sort((a: Conversation, b: Conversation) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        setConversations(filteredConversations.slice(0, 3)); // Show only recent 3
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'ai':
        return <Bot className="h-4 w-4 text-green-600" />;
      case 'agent':
        return <User className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDeliveryStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case 'failed':
        return <CheckCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Message Monitor
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button 
              onClick={fetchConversations} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {testNumber 
            ? `Real-time monitoring for ${testNumber}`
            : 'Real-time conversation monitoring'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {conversations.length} active conversation(s)
          </span>
          {lastUpdate && (
            <span className="text-gray-500">
              Updated {formatTimestamp(lastUpdate.toISOString())}
            </span>
          )}
        </div>

        {/* Conversations */}
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {testNumber ? (
              <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No messages from {testNumber} yet</p>
                <p className="text-sm mt-1">Send a message to start testing</p>
              </div>
            ) : (
              <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent conversations</p>
                <p className="text-sm mt-1">Start a test session to see messages</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">
                      {conversation.customerName || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {conversation.customerPhone}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                </div>
                
                {/* Recent Messages */}
                <div className="space-y-2">
                  {conversation.messages.slice(-3).map((message) => (
                    <div key={message.id} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-1">
                        {getSenderIcon(message.senderType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 mb-1">
                          {message.senderType === 'customer' ? 'Customer' : 
                           message.senderType === 'ai' ? 'AI Assistant' : 'Agent'}
                          {message.aiModelUsed && (
                            <span className="ml-1 text-gray-400">
                              ({message.aiModelUsed})
                            </span>
                          )}
                          {message.processingTimeMs && (
                            <span className="ml-1 text-gray-400">
                              • {message.processingTimeMs}ms
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-800 break-words">
                          {message.content.length > 100 
                            ? `${message.content.substring(0, 100)}...`
                            : message.content
                          }
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getDeliveryStatusIcon(message.deliveryStatus)}
                            <span className="text-xs text-gray-400 capitalize">
                              {message.deliveryStatus || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {conversation.messages.length > 3 && (
                  <div className="text-center mt-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all {conversation.messages.length} messages
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 mb-2">Legend:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-blue-600" />
              <span>Customer</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bot className="h-3 w-3 text-green-600" />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}