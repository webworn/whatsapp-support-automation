'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Copy,
  HelpCircle
} from 'lucide-react';

interface TestInstructions {
  overview: string;
  testNumber: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    action: string;
  }>;
  tips: string[];
  troubleshooting: Array<{
    issue: string;
    solution: string;
  }>;
}

export default function TestInstructions() {
  const [instructions, setInstructions] = useState<TestInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/instructions');
      const data = await response.json();
      
      if (data.status === 'success') {
        setInstructions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyTestNumber = () => {
    if (instructions?.testNumber) {
      navigator.clipboard.writeText(instructions.testNumber);
    }
  };

  const openWhatsApp = () => {
    if (instructions?.testNumber) {
      const cleanNumber = instructions.testNumber.replace(/[^\d]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <CheckCircle className="h-4 w-4" />;
      case 2:
        return <RefreshCw className="h-4 w-4" />;
      case 3:
        return <Phone className="h-4 w-4" />;
      case 4:
        return <Eye className="h-4 w-4" />;
      case 5:
        return <MessageSquare className="h-4 w-4" />;
      case 6:
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!instructions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Failed to load test instructions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Test Instructions
        </CardTitle>
        <CardDescription>
          {instructions.overview}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Number Quick Access */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">Test Number</div>
              <div className="font-mono text-lg text-blue-800">{instructions.testNumber}</div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={copyTestNumber} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={openWhatsApp} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Step-by-step Instructions */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Steps to Test:</h3>
          <div className="space-y-3">
            {instructions.steps.map((step) => (
              <div key={step.step} className="flex space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {getStepIcon(step.step)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {step.step}. {step.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    {step.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">💡 Tips:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {instructions.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-medium text-gray-900"
          >
            🔧 Troubleshooting {showTroubleshooting ? '▼' : '▶'}
          </Button>
          
          {showTroubleshooting && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              {instructions.troubleshooting.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm font-medium text-red-700">
                    Problem: {item.issue}
                  </div>
                  <div className="text-sm text-gray-600">
                    Solution: {item.solution}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button onClick={openWhatsApp} size="sm" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Open WhatsApp
            </Button>
            <Button onClick={copyTestNumber} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Number
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}