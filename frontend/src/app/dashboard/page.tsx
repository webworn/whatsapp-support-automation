'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { conversationsApi, webhooksApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Activity, Zap } from 'lucide-react';
import OnboardingFlow from '@/components/dashboard/OnboardingFlow';

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  aiResponseRate: number;
  averageResponseTime: number;
  webhookStats: {
    total: number;
    processed: number;
    failed: number;
    successRate: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = () => {
    const onboardingCompleted = localStorage.getItem('whatsapp-ai-onboarding-completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [conversationStats, webhookStats, analytics] = await Promise.all([
        conversationsApi.getStats(),
        webhooksApi.getStats(),
        conversationsApi.getAnalytics(),
      ]);

      setStats({
        totalConversations: conversationStats.data.total || 0,
        activeConversations: conversationStats.data.active || 0,
        totalMessages: conversationStats.data.totalMessages || 0,
        aiResponseRate: analytics.data.aiResponseRate || 0,
        averageResponseTime: analytics.data.averageResponseTime || 0,
        webhookStats: webhookStats.data.stats,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      // Set default stats to prevent UI breaks
      setStats({
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0,
        aiResponseRate: 0,
        averageResponseTime: 0,
        webhookStats: {
          total: 0,
          processed: 0,
          failed: 0,
          successRate: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading your WhatsApp AI analytics...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
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
      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={() => setShowOnboarding(false)}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.businessName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your WhatsApp AI assistant today.
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeConversations || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Response Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiResponseRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Automated responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Success</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.webhookStats.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.webhookStats.processed || 0} / {stats?.webhookStats.total || 0} processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your WhatsApp AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">View conversations</span>
              <a href="/dashboard/conversations" className="text-sm text-green-600 hover:text-green-700">
                Go to conversations →
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Manage webhooks</span>
              <a href="/dashboard/webhooks" className="text-sm text-green-600 hover:text-green-700">
                View webhooks →
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Update settings</span>
              <a href="/dashboard/settings" className="text-sm text-green-600 hover:text-green-700">
                Open settings →
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of your WhatsApp AI system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">WhatsApp Webhook</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Processing</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}