'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  status?: {
    status: 'connected' | 'error' | 'disabled';
    testMode: boolean;
    testNumber: string;
    phoneNumberId: string;
    error?: string;
    timestamp: string;
  };
  onCheckConnection: () => void;
  loading: boolean;
}

export default function ConnectionStatus({ 
  status, 
  onCheckConnection, 
  loading 
}: ConnectionStatusProps) {
  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-400" />;
    
    switch (status.status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'disabled':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!status) return 'Unknown';
    
    switch (status.status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'disabled':
        return 'Test Mode Disabled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-gray-600';
    
    switch (status.status) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Connection Status</span>
          </div>
          <Button 
            onClick={onCheckConnection} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check
          </Button>
        </CardTitle>
        <CardDescription>
          WhatsApp Business API connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {status && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">Test Mode:</span>
              <span className={`text-sm ${status.testMode ? 'text-green-600' : 'text-gray-600'}`}>
                {status.testMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Test Number:</span>
              <span className="text-sm font-mono">{status.testNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Phone Number ID:</span>
              <span className="text-sm font-mono">{status.phoneNumberId}</span>
            </div>
            
            {status.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-700">
                  <strong>Error:</strong> {status.error}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </div>
          </>
        )}
        
        {status?.status === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-700">
              ✅ Ready to send and receive test messages
            </div>
          </div>
        )}
        
        {status?.status === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-sm text-red-700">
              ❌ Unable to connect to WhatsApp Business API
            </div>
          </div>
        )}
        
        {status?.status === 'disabled' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="text-sm text-orange-700">
              ⚠️ Test mode is disabled in configuration
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}