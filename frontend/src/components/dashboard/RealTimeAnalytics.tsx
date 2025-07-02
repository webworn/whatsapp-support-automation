'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { conversationsApi } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Bot, 
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';

interface RealTimeData {
  today: {
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
    aiMessages: number;
    aiResponseRate: number;
    avgMessagesPerConversation: number;
  };
  yesterday: {
    totalConversations: number;
    totalMessages: number;
  };
  week: {
    totalConversations: number;
    totalMessages: number;
  };
  trends: {
    messagesGrowth: number;
    conversationsGrowth: number;
  };
  recentActivity: Array<{
    id: string;
    content: string;
    senderType: 'customer' | 'ai' | 'agent';
    timestamp: string;
    conversation: {
      id: string;
      customerName?: string;
      customerPhone: string;
    };
  }>;
}

interface PerformanceData {
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
  messageDistribution: Record<string, number>;
  aiModels: Array<{
    model: string;
    usage: number;
    avgResponseTime: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export default function RealTimeAnalytics() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsResponse, performanceResponse] = await Promise.all([
        conversationsApi.getRealTimeAnalytics(),
        conversationsApi.getPerformanceAnalytics(),
      ]);
      
      setData(analyticsResponse.data);
      setPerformance(performanceResponse.data.performance);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
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
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
          <p className="text-gray-600">
            Live performance metrics and insights
            <span className="ml-2 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 font-semibold">Live</span>
        </div>
      </div>

      {/* Today's Performance Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-blue-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Today's Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{data.today.totalMessages}</div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(data.trends.messagesGrowth)}
              <span className={`text-xs font-medium ${getTrendColor(data.trends.messagesGrowth)}`}>
                {data.trends.messagesGrowth > 0 ? '+' : ''}{data.trends.messagesGrowth}% from yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-green-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700">AI Responses</CardTitle>
            <Bot className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{data.today.aiMessages}</div>
            <p className="text-xs text-green-600 mt-1">
              {data.today.aiResponseRate}% response rate
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-purple-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700">Active Chats</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{data.today.activeConversations}</div>
            <p className="text-xs text-purple-600 mt-1">
              Currently engaged
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-yellow-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-yellow-700">Avg Response Time</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-800">
              {performance ? formatResponseTime(performance.responseTime.average) : '---'}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              AI processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              AI model performance and response times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performance && (
              <>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatResponseTime(performance.responseTime.average)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Fastest Response</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatResponseTime(performance.responseTime.min)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Slowest Response</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatResponseTime(performance.responseTime.max)}
                  </span>
                </div>
                
                {performance.aiModels.length > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Model Usage</h4>
                    {performance.aiModels.map(model => (
                      <div key={model.model} className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">{model.model}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{model.usage} responses</div>
                          <div className="text-xs text-gray-500">
                            {formatResponseTime(model.avgResponseTime)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest messages from your conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentActivity.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                data.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.senderType === 'customer' ? 'bg-blue-100' :
                      activity.senderType === 'ai' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.senderType === 'customer' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : activity.senderType === 'ai' ? (
                        <Bot className="h-4 w-4 text-green-600" />
                      ) : (
                        <Zap className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {activity.conversation.customerName || activity.conversation.customerPhone}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution Chart */}
      {performance && performance.hourlyDistribution.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Message Distribution (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Peak hours for customer interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1 h-32">
              {performance.hourlyDistribution.map(({ hour, count }) => {
                const maxCount = Math.max(...performance.hourlyDistribution.map(h => h.count));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={hour} className="flex flex-col items-center">
                    <div className="flex-1 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm"
                        style={{ height: `${height}%` }}
                        title={`${hour}:00 - ${count} messages`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {hour}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              Hour of day (0-23)
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}