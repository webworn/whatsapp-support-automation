'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  Bot, 
  BotOff, 
  Clock, 
  Phone,
  Filter,
  MoreHorizontal
} from 'lucide-react';

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

interface ConversationStats {
  total: number;
  active: number;
  archived: number;
  totalMessages: number;
}

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []); // Empty dependency array is correct for initial load

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.list({
        search: searchQuery || undefined,
      });
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

  const handleSearch = () => {
    fetchConversations();
  };

  const handleToggleAI = async (conversationId: string) => {
    try {
      await conversationsApi.toggleAI(conversationId);
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, aiEnabled: !conv.aiEnabled }
          : conv
      ));
    } catch (err) {
      console.error('Failed to toggle AI:', err);
      setError('Failed to toggle AI');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'archived') return conv.status === 'archived';
    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-600">Loading your customer conversations...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-600">Manage your customer conversations and AI responses</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/conversations/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.archived || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Start a new conversation or wait for customers to message you.'
                }
              </p>
              <Button onClick={() => router.push('/dashboard/conversations/new')}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {conversation.customerName || 'Unknown Customer'}
                        </h3>
                        {conversation.status === 'archived' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{conversation.customerPhone}</span>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(conversation.lastMessageAt)}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {conversation.messageCount} messages
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={conversation.aiEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAI(conversation.id);
                      }}
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
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}