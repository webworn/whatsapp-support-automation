'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRealTimeConversations } from '@/hooks/useRealTimeConversations';
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
  MoreHorizontal,
  Zap,
  Star,
  TrendingUp,
  CheckCircle2
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const {
    conversations,
    stats,
    loading,
    error,
    toggleAI,
    refreshConversations,
    requestNotificationPermission,
  } = useRealTimeConversations();

  useEffect(() => {
    // Request notification permission on component mount
    requestNotificationPermission().then(granted => {
      setShowNotifications(granted);
    });
  }, [requestNotificationPermission]);

  const handleSearch = () => {
    refreshConversations();
  };

  const handleToggleAI = async (conversationId: string) => {
    await toggleAI(conversationId);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customerPhone.includes(searchQuery);
    
    if (filter === 'active') return conv.status === 'active' && matchesSearch;
    if (filter === 'archived') return conv.status === 'archived' && matchesSearch;
    return matchesSearch;
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Conversations
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-semibold">Live Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <p className="text-gray-600">Manage your customer conversations with AI-powered responses</p>
            {showNotifications && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Notifications active</span>
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/conversations/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          New Conversation
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-blue-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Conversations</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{stats?.total || 0}</div>
            <p className="text-xs text-blue-600 mt-1">All time conversations</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-green-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700">Active Chats</CardTitle>
            <Zap className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{stats?.active || 0}</div>
            <p className="text-xs text-green-600 mt-1">Currently engaged</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-yellow-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-yellow-700">Archived</CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-800">{stats?.archived || 0}</div>
            <p className="text-xs text-yellow-600 mt-1">Completed conversations</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-purple-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700">Total Messages</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-purple-600 mt-1">Messages exchanged</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filter */}
      <Card className="p-6 border-0 shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              variant="outline"
              className="h-12 px-6 border-gray-200 hover:bg-gray-50"
            >
              Search
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'archived')}
              className="h-12 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Conversations</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Enhanced Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No conversations found</h3>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters to find the conversations you\'re looking for.'
                  : 'Start engaging with your customers! Create a new conversation or wait for incoming messages.'
                }
              </p>
              <Button 
                onClick={() => router.push('/dashboard/conversations/new')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-102 bg-white"
              onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <Phone className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {conversation.customerName || 'Unknown Customer'}
                        </h3>
                        {conversation.status === 'active' && (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold">Active</span>
                          </div>
                        )}
                        {conversation.status === 'archived' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Star className="h-3 w-3 mr-1" />
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{conversation.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(conversation.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{conversation.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant={conversation.aiEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAI(conversation.id);
                      }}
                      className={conversation.aiEnabled 
                        ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-md" 
                        : "border-2 border-gray-200 hover:border-gray-300 font-semibold"
                      }
                    >
                      {conversation.aiEnabled ? (
                        <>
                          <Bot className="h-4 w-4 mr-1" />
                          AI Active
                        </>
                      ) : (
                        <>
                          <BotOff className="h-4 w-4 mr-1" />
                          AI Disabled
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreHorizontal className="h-5 w-5" />
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