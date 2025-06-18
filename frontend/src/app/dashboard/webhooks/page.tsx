'use client';

import { useEffect, useState } from 'react';
import { webhooksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Webhook, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';

interface WebhookLog {
  id: string;
  source: string;
  payload: string;
  isValid: boolean;
  processed: boolean;
  error?: string;
  createdAt: string;
}

interface WebhookStats {
  total: number;
  processed: number;
  failed: number;
  recent: number;
  successRate: number;
}

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWebhookData();
  }, []);

  const fetchWebhookData = async () => {
    try {
      setRefreshing(true);
      const [logsResponse, statsResponse] = await Promise.all([
        webhooksApi.getLogs(50),
        webhooksApi.getStats(),
      ]);

      setLogs(logsResponse.data.logs || []);
      setStats(statsResponse.data.stats);
    } catch (err) {
      console.error('Failed to fetch webhook data:', err);
      setError('Failed to load webhook data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWebhookData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncatePayload = (payload: string, maxLength: number = 200) => {
    if (payload.length <= maxLength) return payload;
    return payload.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600">Loading webhook data...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600">Monitor WhatsApp webhook activity and integration status</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Your WhatsApp webhook endpoints and setup information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm">
                  {process.env.NEXT_PUBLIC_API_URL}/api/webhook/whatsapp
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/whatsapp`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm">
                  GET /api/webhook/whatsapp
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/health`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Setup Instructions</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Configure these URLs in your WhatsApp Business API settings to receive real-time message notifications.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.processed || 0} processed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processing failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Webhook Endpoint</span>
              </div>
              <span className="text-sm text-green-700">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Message Processing</span>
              </div>
              <span className="text-sm text-green-700">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Database</span>
              </div>
              <span className="text-sm text-green-700">Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Webhook Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Activity</CardTitle>
          <CardDescription>
            Latest webhook requests and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook activity</h3>
              <p className="text-gray-500">
                Webhook requests will appear here when your WhatsApp integration receives messages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {log.processed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {log.source} webhook
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.processed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.processed ? 'Success' : 'Failed'}
                        </span>
                        {!log.isValid && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Invalid Signature
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View payload ({log.payload.length} characters)
                        </summary>
                        <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                          <div className="flex items-start justify-between">
                            <pre className="whitespace-pre-wrap break-all">
                              {truncatePayload(log.payload, 500)}
                            </pre>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(log.payload)}
                              className="ml-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </details>
                    </div>
                    
                    {log.error && (
                      <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-red-900">Error:</span>
                          <span className="text-sm text-red-700 ml-1">{log.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}