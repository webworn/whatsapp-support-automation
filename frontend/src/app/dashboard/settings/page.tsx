'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  Building, 
  Shield,
  Save,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    whatsappPhoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        businessName: user.businessName || '',
        whatsappPhoneNumber: user.whatsappPhoneNumber || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        businessName: profileForm.businessName.trim() || undefined,
        whatsappPhoneNumber: profileForm.whatsappPhoneNumber.trim() || undefined,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setProfileForm(prev => ({
      ...prev,
      whatsappPhoneNumber: formatted
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Mock API configuration data (in production, this would come from backend)
  const apiConfig = {
    webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/whatsapp`,
    verificationUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/whatsapp`,
    webhookSecret: '••••••••••••••••',
    apiEndpoint: process.env.NEXT_PUBLIC_API_URL,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and WhatsApp integration settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your business information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={profileForm.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter your business name"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* WhatsApp Phone Number */}
              <div className="md:col-span-2">
                <label htmlFor="whatsappPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="whatsappPhoneNumber"
                    name="whatsappPhoneNumber"
                    type="tel"
                    value={profileForm.whatsappPhoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+1234567890"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This should match your WhatsApp Business API phone number
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* WhatsApp Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>
            Configuration details for your WhatsApp Business API integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {apiConfig.webhookUrl}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(apiConfig.webhookUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use this URL in your WhatsApp Business API webhook configuration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {apiConfig.verificationUrl}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(apiConfig.verificationUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  WhatsApp will verify this URL during setup
                </p>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Endpoint
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {apiConfig.apiEndpoint}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(apiConfig.apiEndpoint || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Webhook Secret
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showApiKeys ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {showApiKeys ? 'your-webhook-secret-key' : apiConfig.webhookSecret}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard('your-webhook-secret-key')}
                    disabled={!showApiKeys}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Configure this secret in your environment variables
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Account Created:</span>
                <span className="ml-2 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Email Verified:</span>
                <span className="ml-2">
                  {user?.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      Not Verified
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Session Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Active Session</h4>
                <p className="text-sm text-gray-500">Current browser session</p>
              </div>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Environment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Information</h3>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Environment:</span>
                  <span className="ml-2 font-medium">Production</span>
                </div>
                <div>
                  <span className="text-gray-500">API Version:</span>
                  <span className="ml-2 font-medium">v1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-500">Deployment:</span>
                  <span className="ml-2 font-medium">Railway</span>
                </div>
                <div>
                  <span className="text-gray-500">Database:</span>
                  <span className="ml-2 font-medium">SQLite</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}