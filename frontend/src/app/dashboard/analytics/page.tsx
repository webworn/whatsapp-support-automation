'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import RealTimeAnalytics from '@/components/dashboard/RealTimeAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  Download, 
  Calendar,
  Filter,
  Settings,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights for {user?.businessName}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-emerald-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">System Status</CardTitle>
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">Operational</div>
            <p className="text-xs text-emerald-600 mt-1">All systems running</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-blue-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Data Accuracy</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">99.8%</div>
            <p className="text-xs text-blue-600 mt-1">Real-time sync</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-amber-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700">Update Frequency</CardTitle>
            <Calendar className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">30s</div>
            <p className="text-xs text-amber-600 mt-1">Auto-refresh interval</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-violet-50 to-violet-100">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-violet-200 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-violet-700">Data Retention</CardTitle>
            <Filter className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-800">90 days</div>
            <p className="text-xs text-violet-600 mt-1">Historical data</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Notice */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Real-Time Analytics Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your dashboard updates automatically every 30 seconds with live data from your WhatsApp conversations. 
                Analytics include message volumes, AI response rates, and performance metrics.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Analytics Component */}
      <RealTimeAnalytics />

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>
              Understanding your customer base and behavior patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Peak Hours</span>
                  <span className="text-lg font-bold text-gray-900">10 AM - 2 PM</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Highest customer activity</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Avg Session Length</span>
                  <span className="text-lg font-bold text-gray-900">8.5 minutes</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Customer engagement time</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                  <span className="text-lg font-bold text-green-600">94.2%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Issues resolved by AI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>AI Performance</CardTitle>
            <CardDescription>
              Artificial intelligence effectiveness and optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Success Rate</span>
                  <span className="text-lg font-bold text-green-800">96.8%</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Successful AI responses</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Learning Rate</span>
                  <span className="text-lg font-bold text-blue-800">+12%</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Improvement this week</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">Cost Efficiency</span>
                  <span className="text-lg font-bold text-purple-800">$0.02</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">Per conversation cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}