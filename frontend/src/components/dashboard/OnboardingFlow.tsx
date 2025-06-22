'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Smartphone, 
  Bot, 
  MessageSquare, 
  FileText, 
  ArrowRight, 
  X, 
  ExternalLink,
  Zap,
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  optional?: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function OnboardingFlow({ onComplete, onClose }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to WhatsApp AI',
      description: 'Get started with your AI-powered customer support system',
      icon: Zap,
      completed: false,
    },
    {
      id: 'whatsapp',
      title: 'Connect WhatsApp',
      description: 'Set up webhook integration with WhatsApp Business API',
      icon: Smartphone,
      completed: false,
    },
    {
      id: 'ai-config',
      title: 'Configure AI',
      description: 'Choose your AI model and customize response behavior',
      icon: Bot,
      completed: false,
    },
    {
      id: 'test-message',
      title: 'Send Test Message',
      description: 'Verify your setup with a test conversation',
      icon: MessageSquare,
      completed: false,
    },
    {
      id: 'knowledge-base',
      title: 'Add Knowledge',
      description: 'Upload documents to improve AI responses',
      icon: FileText,
      completed: false,
      optional: true,
    },
  ]);

  const [formData, setFormData] = useState({
    whatsappPhone: user?.whatsappPhoneNumber || '',
    webhookUrl: '',
    aiModel: 'claude-haiku',
    responseStyle: 'professional',
    testPhone: '',
    testMessage: 'Hello! This is a test message to verify our WhatsApp AI integration.',
  });

  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  const handleStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    // Save onboarding completion to localStorage
    localStorage.setItem('whatsapp-ai-onboarding-completed', 'true');
    onComplete();
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to WhatsApp AI</h3>
              <p className="text-gray-600 text-lg">
                Let's set up your AI-powered customer support system in just a few steps.
                This will take about 5 minutes.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">What you'll accomplish:</h4>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Connect your WhatsApp Business account
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Configure AI responses and behavior
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Test your setup with a real message
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Upload knowledge base documents (optional)
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => handleStepComplete('welcome')}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg"
            >
              Let's Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect WhatsApp Business</h3>
              <p className="text-gray-600">
                Set up webhook integration to receive and send messages
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.whatsappPhone}
                  onChange={(e) => setFormData({...formData, whatsappPhone: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (Copy this to your WhatsApp Business settings)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={`${window.location.origin}/api/webhooks/whatsapp-business`}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp-business`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Go to your WhatsApp Business API dashboard</li>
                <li>Navigate to Webhook settings</li>
                <li>Paste the webhook URL above</li>
                <li>Set the verify token to: <code className="bg-yellow-200 px-1 rounded">whatsapp_ai_verify</code></li>
                <li>Subscribe to message events</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipStep}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => handleStepComplete('whatsapp')}
                disabled={!formData.whatsappPhone}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'ai-config':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Configure AI Responses</h3>
              <p className="text-gray-600">
                Customize how your AI assistant responds to customers
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={formData.aiModel}
                  onChange={(e) => setFormData({...formData, aiModel: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="claude-haiku">Claude Haiku (Fast & Cost-effective)</option>
                  <option value="claude-sonnet">Claude Sonnet (Balanced)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fallback)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Style
                </label>
                <select
                  value={formData.responseStyle}
                  onChange={(e) => setFormData({...formData, responseStyle: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Professional & Formal</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="concise">Concise & Direct</option>
                  <option value="detailed">Detailed & Helpful</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">AI Features Enabled:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Automatic response generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Context-aware conversations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Business-specific knowledge integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Human handoff when needed
                </li>
              </ul>
            </div>

            <Button
              onClick={() => handleStepComplete('ai-config')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save AI Configuration
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'test-message':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Test Your Setup</h3>
              <p className="text-gray-600">
                Send a test message to verify everything is working correctly
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.testPhone}
                  onChange={(e) => setFormData({...formData, testPhone: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <textarea
                  value={formData.testMessage}
                  onChange={(e) => setFormData({...formData, testMessage: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a test message..."
                />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Test Process:</h4>
              <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                <li>We'll send the test message to the specified number</li>
                <li>The AI will process and generate a response</li>
                <li>You'll see the conversation in your dashboard</li>
                <li>Verify the response quality and timing</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipStep}
                className="flex-1"
              >
                Skip Test
              </Button>
              <Button
                onClick={() => handleStepComplete('test-message')}
                disabled={!formData.testPhone || !formData.testMessage}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Send Test Message
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'knowledge-base':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add Knowledge Base</h3>
              <p className="text-gray-600">
                Upload documents to help AI provide better, more accurate responses (Optional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Upload Documents</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  id="knowledge-upload"
                />
                <Button
                  onClick={() => document.getElementById('knowledge-upload')?.click()}
                  variant="outline"
                  className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                >
                  Select Files
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-1">Recommended:</h5>
                  <ul className="text-green-800 space-y-1">
                    <li>• FAQ documents</li>
                    <li>• Product catalogs</li>
                    <li>• Company policies</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-1">Supported:</h5>
                  <ul className="text-blue-800 space-y-1">
                    <li>• PDF files</li>
                    <li>• Word documents</li>
                    <li>• Text files</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleStepComplete('knowledge-base')}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => handleStepComplete('knowledge-base')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if this is the last step
  const isLastStep = currentStep === steps.length - 1;
  const allRequiredStepsCompleted = steps.filter(s => !s.optional).every(s => s.completed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Setup Wizard</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-semibold">{progress}% Complete</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{progress}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {isLastStep && allRequiredStepsCompleted && (
          <div className="px-6 pb-6">
            <Button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg"
            >
              Complete Setup & Go to Dashboard
              <CheckCircle2 className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}