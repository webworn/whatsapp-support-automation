'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface DeletionStatus {
  confirmation_code: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  requested_at: string;
  processed_at?: string;
}

function DataDeletionStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<DeletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const confirmationCode = searchParams.get('code');

  useEffect(() => {
    if (confirmationCode) {
      fetchDeletionStatus(confirmationCode);
    } else {
      setError('No confirmation code provided');
      setLoading(false);
    }
  }, [confirmationCode]);

  const fetchDeletionStatus = async (code: string) => {
    try {
      const response = await fetch(`/api/data-deletion/status?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setError('Confirmation code not found');
      }
    } catch (err) {
      setError('Failed to fetch deletion status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'processing':
        return <Clock className="h-8 w-8 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'processing':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Checking deletion status...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{error}</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check your confirmation code or contact support at orionarmentp@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(status?.status || 'pending')}
              <span className="ml-3">Data Deletion Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status && (
              <>
                <div className={`p-4 rounded-lg border ${getStatusColor(status.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Status</span>
                    <span className="capitalize font-medium">{status.status}</span>
                  </div>
                  <p className="text-sm">{status.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Confirmation Code</h3>
                    <p className="text-sm font-mono text-gray-600 break-all">{status.confirmation_code}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Requested</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(status.requested_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {status.processed_at && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Processed</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(status.processed_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                  
                  {status.status === 'pending' && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Your request has been received and is queued for processing</p>
                      <p>• Data deletion will begin within 24-48 hours</p>
                      <p>• You will receive an email confirmation when completed</p>
                      <p>• Processing typically takes 7-30 days</p>
                    </div>
                  )}

                  {status.status === 'processing' && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Your data is currently being deleted from our systems</p>
                      <p>• This includes account information, messages, and analytics data</p>
                      <p>• Completion expected within 7-30 days</p>
                      <p>• You will receive an email when the process is complete</p>
                    </div>
                  )}

                  {status.status === 'completed' && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• ✅ All your personal data has been permanently deleted</p>
                      <p>• ✅ Account information and conversation history removed</p>
                      <p>• ✅ Analytics and usage data cleared</p>
                      <p>• This action cannot be undone</p>
                    </div>
                  )}

                  {status.status === 'failed' && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• There was an issue processing your deletion request</p>
                      <p>• Please contact our support team for assistance</p>
                      <p>• Email: orionarmentp@gmail.com</p>
                      <p>• Include your confirmation code in your message</p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Save this confirmation code for your records</li>
                    <li>• Data deletion is permanent and cannot be reversed</li>
                    <li>• Some data may be retained for legal compliance</li>
                    <li>• Contact support if you have questions about this process</li>
                  </ul>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Need help? Contact us at{' '}
                    <a href="mailto:orionarmentp@gmail.com" className="text-blue-600 hover:text-blue-800">
                      orionarmentp@gmail.com
                    </a>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DataDeletionStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <DataDeletionStatusContent />
    </Suspense>
  );
}