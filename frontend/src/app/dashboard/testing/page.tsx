'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import TestInstructions from '@/components/testing/TestInstructions';
import ConnectionStatus from '@/components/testing/ConnectionStatus';
import MessageMonitor from '@/components/testing/MessageMonitor';

interface TestStatus {
  connection: {
    status: 'connected' | 'error' | 'disabled';
    testMode: boolean;
    testNumber: string;
    phoneNumberId: string;
    error?: string;
  };
  stats: {
    testMode: boolean;
    testNumber: string;
    phoneNumberId: string;
    activeSessions: number;
    totalMessagesSent: number;
    maxMessagesPerSession: number;
    sessionTimeoutMinutes: number;
  };
  configuration: {
    enabled: boolean;
    testNumber: string;
    phoneNumberId: string;
    maxMessages: number;
    sessionTimeoutMinutes: number;
  };
}

interface TestSession {
  active: boolean;
  sessionId?: string;
  messageCount: number;
  maxMessages: number;
  expiresAt?: string;
  testNumber: string;
}

export default function TestingPage() {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isTestingActive, setIsTestingActive] = useState(false);

  useEffect(() => {
    fetchTestStatus();
  }, []);

  const fetchTestStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/status');
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestStatus(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to load test status');
      }
    } catch (err) {
      console.error('Failed to fetch test status:', err);
      setError('Failed to connect to testing service');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/connection');
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestStatus(prev => prev ? { ...prev, connection: data.data } : null);
        setError('');
      } else {
        setError(data.message || 'Connection check failed');
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setError('Failed to check connection');
    } finally {
      setLoading(false);
    }
  };

  const startTestSession = async () => {
    try {
      setLoading(true);
      const testNumber = testStatus?.configuration?.testNumber || '+15556485637';
      
      const response = await fetch(`/api/test/session?phone=${encodeURIComponent(testNumber)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestSession(data.data);
        setIsTestingActive(true);
        setError('');
      } else {
        setError(data.message || 'Failed to start test session');
      }
    } catch (err) {
      console.error('Failed to start test session:', err);
      setError('Failed to start test session');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim()) {
      setError('Please enter a test message');
      return;
    }

    try {
      setLoading(true);
      const testNumber = testStatus?.configuration?.testNumber || '+15556485637';
      
      const response = await fetch('/api/test/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          to: testNumber,
          message: testMessage,
          customerName: 'Test Customer',
        }),
      });
      
      const data = await response.json();
      setLastResponse(data);
      
      if (data.status === 'success') {
        setTestMessage('');
        setError('');
        // Refresh session data
        await startTestSession();
      } else {
        setError(data.message || 'Failed to send test message');
      }
    } catch (err) {
      console.error('Failed to send test message:', err);
      setError('Failed to send test message');
    } finally {
      setLoading(false);
    }
  };

  const simulateIncomingMessage = async () => {
    if (!testMessage.trim()) {
      setError('Please enter a message to simulate');
      return;
    }

    try {
      setLoading(true);
      const testNumber = testStatus?.configuration?.testNumber || '+15556485637';
      
      const response = await fetch('/api/test/simulate-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          from: testNumber,
          message: testMessage,
          customerName: 'Test Customer',
        }),
      });
      
      const data = await response.json();
      setLastResponse(data);
      
      if (data.status === 'success') {
        setTestMessage('');
        setError('');
      } else {
        setError(data.message || 'Failed to simulate incoming message');
      }
    } catch (err) {
      console.error('Failed to simulate incoming message:', err);
      setError('Failed to simulate incoming message');
    } finally {
      setLoading(false);
    }
  };

  const copyTestNumber = () => {
    const testNumber = testStatus?.configuration?.testNumber || '+15556485637';
    navigator.clipboard.writeText(testNumber);
  };

  const openWhatsApp = () => {
    const testNumber = testStatus?.configuration?.testNumber || '+15556485637';
    const cleanNumber = testNumber.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  if (loading && !testStatus) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Testing</h1>
          <p className="text-gray-600">Loading testing interface...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Testing</h1>
          <p className="text-gray-600">
            Test your WhatsApp AI system using Meta's official test number
          </p>
        </div>
        <Button 
          onClick={fetchTestStatus} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <ConnectionStatus 
        status={testStatus?.connection} 
        onCheckConnection={checkConnection}
        loading={loading}
      />

      {/* Test Configuration */}
      {testStatus?.configuration?.enabled && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Test Number Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Test Number
              </CardTitle>
              <CardDescription>
                Meta's official WhatsApp test number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-lg">
                  {testStatus.configuration.testNumber}
                </span>
                <div className="flex space-x-2">
                  <Button onClick={copyTestNumber} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={openWhatsApp} variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Phone Number ID: {testStatus.configuration.phoneNumberId}</p>
                <p>Max Messages: {testStatus.configuration.maxMessages} per session</p>
                <p>Session Timeout: {testStatus.configuration.sessionTimeoutMinutes} minutes</p>
              </div>
            </CardContent>
          </Card>

          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Test Session
              </CardTitle>
              <CardDescription>
                Current testing session status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testSession ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages Sent:</span>
                    <span>{testSession.messageCount} / {testSession.maxMessages}</span>
                  </div>
                  {testSession.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expires:</span>
                      <span className="text-sm">
                        {new Date(testSession.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <Button 
                    onClick={() => setIsTestingActive(false)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center p-4 text-gray-500">
                    <XCircle className="h-8 w-8 mr-2" />
                    No active session
                  </div>
                  <Button 
                    onClick={startTestSession} 
                    className="w-full"
                    disabled={loading}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Test Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Actions */}
      {testStatus?.configuration?.enabled && testSession && (
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>
              Send test messages or simulate incoming messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                className="flex-1"
              />
              <Button 
                onClick={sendTestMessage}
                disabled={loading || !testMessage.trim()}
              >
                Send to Test Number
              </Button>
              <Button 
                onClick={simulateIncomingMessage}
                disabled={loading || !testMessage.trim()}
                variant="outline"
              >
                Simulate Incoming
              </Button>
            </div>
            
            {lastResponse && (
              <div className="p-3 bg-gray-50 rounded text-sm">
                <div className="font-medium mb-2">Last Response:</div>
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions and Monitor */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TestInstructions />
        <MessageMonitor testNumber={testStatus?.configuration?.testNumber} />
      </div>

      {/* Test not enabled message */}
      {!testStatus?.configuration?.enabled && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Test Mode Disabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              WhatsApp testing mode is currently disabled. To enable testing:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Set <code>WHATSAPP_TEST_MODE=true</code> in your environment variables</li>
              <li>Optionally set <code>WHATSAPP_TEST_NUMBER=+15556485637</code></li>
              <li>Restart the application</li>
              <li>Refresh this page</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}