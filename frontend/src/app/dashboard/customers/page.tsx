'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  Phone, 
  MessageSquare, 
  Clock, 
  Bot,
  BotOff,
  UserPlus,
  MoreHorizontal,
  Filter
} from 'lucide-react';

interface Customer {
  customerPhone: string;
  customerName?: string;
  conversationCount: number;
  totalMessages: number;
  lastMessageAt: string;
  firstContactAt: string;
  aiEnabled: boolean;
  status: 'active' | 'archived';
  latestConversationId: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Get all conversations and group by customer
      const response = await conversationsApi.list({ limit: 1000 });
      const conversations = response.data.conversations || [];
      
      // Group conversations by customer phone
      const customerMap = new Map<string, Customer>();
      
      conversations.forEach((conv: { id: string; customerPhone: string; customerName?: string; messageCount?: number; lastMessageAt: string; createdAt: string; aiEnabled: boolean; status: 'active' | 'archived' }) => {
        const phone = conv.customerPhone;
        
        if (customerMap.has(phone)) {
          const existing = customerMap.get(phone)!;
          existing.conversationCount += 1;
          existing.totalMessages += conv.messageCount || 0;
          
          // Update latest conversation if this one is more recent
          if (new Date(conv.lastMessageAt) > new Date(existing.lastMessageAt)) {
            existing.lastMessageAt = conv.lastMessageAt;
            existing.latestConversationId = conv.id;
            existing.aiEnabled = conv.aiEnabled;
            existing.status = conv.status;
          }
          
          // Update first contact if this one is earlier
          if (new Date(conv.createdAt) < new Date(existing.firstContactAt)) {
            existing.firstContactAt = conv.createdAt;
          }
        } else {
          customerMap.set(phone, {
            customerPhone: phone,
            customerName: conv.customerName,
            conversationCount: 1,
            totalMessages: conv.messageCount || 0,
            lastMessageAt: conv.lastMessageAt,
            firstContactAt: conv.createdAt,
            aiEnabled: conv.aiEnabled,
            status: conv.status,
            latestConversationId: conv.id,
          });
        }
      });
      
      // Convert map to array and sort by last message time
      const customersArray = Array.from(customerMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      setCustomers(customersArray);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter customers based on search query
    // This is client-side filtering since we're aggregating data
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => {
    // Apply status filter
    if (filter === 'active' && customer.status !== 'active') return false;
    if (filter === 'archived' && customer.status !== 'archived') return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        customer.customerPhone.toLowerCase().includes(query) ||
        (customer.customerName?.toLowerCase().includes(query))
      );
    }
    
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Loading your customers...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const archivedCustomers = customers.filter(c => c.status === 'archived').length;
  const totalMessages = customers.reduce((sum, c) => sum + c.totalMessages, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships and conversation history</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/conversations/new')}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Customer
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
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

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Start a conversation to see customers here.'
                }
              </p>
              <Button onClick={() => router.push('/dashboard/conversations/new')}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.customerPhone} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/conversations/${customer.latestConversationId}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">
                          {customer.customerName || 'Unknown Customer'}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {customer.customerPhone}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {customer.aiEnabled ? (
                        <Bot className="h-4 w-4 text-green-600" />
                      ) : (
                        <BotOff className="h-4 w-4 text-gray-400" />
                      )}
                      
                      {customer.status === 'archived' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {customer.conversationCount} conversation{customer.conversationCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {customer.totalMessages} messages
                        </span>
                      </div>
                    </div>
                    
                    {/* Timestamps */}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Last active: {formatTime(customer.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>First contact: {formatDate(customer.firstContactAt)}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/conversations/${customer.latestConversationId}`);
                        }}
                      >
                        View Chat
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}