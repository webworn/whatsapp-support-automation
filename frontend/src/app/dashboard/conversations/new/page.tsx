'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, User, Bot } from 'lucide-react';

export default function NewConversationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerPhone: '',
    customerName: '',
    aiEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customerPhone.trim()) {
      setError('Phone number is required');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await conversationsApi.create({
        customerPhone: formData.customerPhone.trim(),
        customerName: formData.customerName.trim() || undefined,
        aiEnabled: formData.aiEnabled,
      });

      // Redirect to the new conversation
      router.push(`/dashboard/conversations/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create conversation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, and has digits, add +
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      customerPhone: formatted
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/conversations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Conversation</h1>
          <p className="text-gray-600">Start a new conversation with a customer</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Enter the customer&apos;s details to start a new conversation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="+1234567890"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>

            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name (optional)"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Optional: Customer name for easier identification
              </p>
            </div>

            {/* AI Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                AI Assistant Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="aiEnabled"
                    name="aiEnabled"
                    type="checkbox"
                    checked={formData.aiEnabled}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="aiEnabled" className="ml-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Enable AI responses</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-7">
                  When enabled, AI will automatically respond to customer messages. 
                  You can toggle this setting anytime during the conversation.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Start Conversation
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/conversations')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">
              1
            </div>
            <div>
              <strong>Enter customer details:</strong> Add the customer&apos;s WhatsApp phone number and optionally their name.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">
              2
            </div>
            <div>
              <strong>Configure AI:</strong> Choose whether to enable AI responses immediately or manage them manually.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">
              3
            </div>
            <div>
              <strong>Start messaging:</strong> Begin the conversation and the system will track all interactions.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}