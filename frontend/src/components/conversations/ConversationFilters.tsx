'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Calendar,
  Users,
  Bot,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';

interface ConversationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: 'all' | 'active' | 'archived';
  onFilterChange: (filter: 'all' | 'active' | 'archived') => void;
  sortBy: 'newest' | 'oldest' | 'activity';
  onSortChange: (sort: 'newest' | 'oldest' | 'activity') => void;
  aiFilter: 'all' | 'enabled' | 'disabled';
  onAiFilterChange: (filter: 'all' | 'enabled' | 'disabled') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function ConversationFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  aiFilter,
  onAiFilterChange,
  onRefresh,
  isRefreshing = false,
}: ConversationFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onRefresh();
  };

  return (
    <Card className="p-6 border-0 shadow-lg bg-white">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col space-y-4">
          {/* Main search and filter row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by name or phone number..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>
              <Button 
                type="submit"
                variant="outline"
                className="h-12 px-6 border-gray-200 hover:bg-gray-50"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-12 px-4 border-gray-200 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-12 px-4 border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Status
                </label>
                <select 
                  value={filter} 
                  onChange={(e) => onFilterChange(e.target.value as 'all' | 'active' | 'archived')}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Conversations</option>
                  <option value="active">Active Only</option>
                  <option value="archived">Archived Only</option>
                </select>
              </div>

              {/* AI Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Status
                </label>
                <select 
                  value={aiFilter} 
                  onChange={(e) => onAiFilterChange(e.target.value as 'all' | 'enabled' | 'disabled')}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="all">All AI Status</option>
                  <option value="enabled">AI Enabled</option>
                  <option value="disabled">AI Disabled</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {sortBy === 'newest' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                  Sort By
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest' | 'activity')}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="activity">Recent Activity</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </label>
                <select 
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  defaultValue="all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={filter === 'active' ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange('active')}
              className="text-xs"
            >
              Active Chats
            </Button>
            <Button
              type="button"
              variant={aiFilter === 'enabled' ? "default" : "outline"}
              size="sm"
              onClick={() => onAiFilterChange('enabled')}
              className="text-xs"
            >
              AI Enabled
            </Button>
            <Button
              type="button"
              variant={sortBy === 'activity' ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange('activity')}
              className="text-xs"
            >
              Recent Activity
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}