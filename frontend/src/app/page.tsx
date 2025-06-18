'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
// Removed unused Card imports
import { MessageSquare, Zap, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    name: 'AI-Powered Responses',
    description: 'Automatically respond to customer inquiries using advanced AI technology.',
    icon: Zap,
  },
  {
    name: 'Conversation Management',
    description: 'View, manage, and track all customer conversations in one place.',
    icon: MessageSquare,
  },
  {
    name: 'Customer Insights',
    description: 'Get detailed analytics about your customers and conversation patterns.',
    icon: Users,
  },
  {
    name: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee.',
    icon: Shield,
  },
];

const benefits = [
  'Reduce response time by 90%',
  'Handle 10x more customer inquiries',
  'Available 24/7 customer support',
  'Integrate with existing WhatsApp Business',
  'Easy setup in under 5 minutes',
  'No technical knowledge required',
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WhatsApp AI Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Automate your</span>{' '}
                  <span className="block text-green-600 xl:inline">WhatsApp support</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Transform your customer service with AI-powered WhatsApp automation. 
                  Respond to customers instantly, manage conversations effortlessly, and grow your business.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/register">
                      <Button size="lg" className="w-full">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/login">
                      <Button variant="outline" size="lg" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-green-400 to-green-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <MessageSquare className="h-32 w-32 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to automate WhatsApp
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI-powered platform helps you manage customer conversations, automate responses, and grow your business.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why choose WhatsApp AI Assistant?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Join thousands of businesses that have automated their WhatsApp customer support and increased customer satisfaction.
              </p>
              <div className="mt-8 sm:flex">
                <div className="rounded-md shadow">
                  <Link href="/register">
                    <Button size="lg">
                      Get started today
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to automate your WhatsApp?</span>
            <span className="block">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-green-200">
            No credit card required. Setup takes less than 5 minutes.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="mt-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            {/* Add social links here if needed */}
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 WhatsApp AI Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}