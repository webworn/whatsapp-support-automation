'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Brain,
  Clock,
  Globe,
  Lock,
  Smartphone,
  BarChart3,
  Settings,
  PlayCircle,
  Star,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Value propositions for hero section
const valueProps = [
  {
    icon: Zap,
    title: 'Instant AI Responses',
    description: '95% faster than human agents'
  },
  {
    icon: Brain,
    title: 'Smart Learning',
    description: 'AI adapts to your business knowledge'
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Native',
    description: 'Works directly in your existing workflow'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance'
  }
];

// Features showcase with three columns
const featureColumns = [
  {
    title: 'AI Intelligence',
    features: [
      'Natural Language Processing',
      'Context Understanding',
      'Multi-language Support',
      'Learning from Interactions'
    ]
  },
  {
    title: 'Business Integration',
    features: [
      'WhatsApp Business API',
      'CRM Synchronization',
      'Knowledge Base Integration',
      'Custom Workflow Automation'
    ]
  },
  {
    title: 'Management & Analytics',
    features: [
      'Real-time Dashboard',
      'Performance Analytics',
      'Team Collaboration',
      'ROI Tracking'
    ]
  }
];

// How it works steps
const processSteps = [
  {
    step: 1,
    title: 'Connect Your WhatsApp',
    description: 'Simple webhook integration',
    icon: Smartphone
  },
  {
    step: 2,
    title: 'Train Your AI',
    description: 'Upload knowledge base and configure responses',
    icon: Settings
  },
  {
    step: 3,
    title: 'Go Live',
    description: 'AI starts handling conversations automatically',
    icon: Zap
  },
  {
    step: 4,
    title: 'Scale & Optimize',
    description: 'Monitor performance and improve over time',
    icon: BarChart3
  }
];

// Pricing tiers
const pricingTiers = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    features: [
      '1,000 messages',
      'Basic AI',
      'Email Support',
      'WhatsApp Integration',
      'Basic Analytics'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/mo',
    features: [
      '10,000 messages',
      'Advanced AI',
      'Priority Support',
      'Custom Knowledge Base',
      'Advanced Analytics',
      'Team Collaboration'
    ],
    cta: 'Start Free',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited messages',
      'Custom AI Training',
      'Dedicated Manager',
      'Custom Integrations',
      'Advanced Security',
      'SLA Guarantee'
    ],
    cta: 'Contact Us',
    popular: false
  }
];

// Testimonials
const testimonials = [
  {
    quote: "Our response time dropped from 4 hours to 30 seconds. Customer satisfaction increased by 40%",
    author: "Sarah Chen",
    title: "Customer Success Manager",
    company: "TechCorp Solutions",
    rating: 5
  },
  {
    quote: "WhatsApp AI transformed our customer support. We're handling 10x more inquiries with the same team.",
    author: "Miguel Rodriguez",
    title: "Operations Director",
    company: "E-commerce Plus",
    rating: 5
  },
  {
    quote: "The AI learns our business context perfectly. Customers can't tell they're talking to a bot.",
    author: "Priya Patel",
    title: "Founder",
    company: "HealthCare Connect",
    rating: 5
  }
];

// FAQ data
const faqs = [
  {
    question: "How does the AI learn my business?",
    answer: "Our AI learns through your knowledge base documents, conversation history, and feedback. You can upload FAQs, product catalogs, and policies that the AI will reference to provide accurate responses."
  },
  {
    question: "Is my WhatsApp data secure?",
    answer: "Yes, we use bank-level encryption and comply with GDPR, CCPA, and other privacy regulations. Your data is never shared with third parties and you maintain full control."
  },
  {
    question: "Can I hand off to human agents?",
    answer: "Absolutely! You can seamlessly transfer conversations to human agents at any time. The AI can also automatically escalate complex queries based on your rules."
  },
  {
    question: "What languages are supported?",
    answer: "Our AI supports 50+ languages including English, Spanish, French, German, Portuguese, Hindi, Arabic, and more. The AI automatically detects the customer's language."
  },
  {
    question: "How quickly can I set up?",
    answer: "Most businesses are up and running in under 10 minutes. Our setup wizard guides you through WhatsApp integration, AI configuration, and knowledge base upload."
  }
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentDemo, setCurrentDemo] = useState(0);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Demo scenarios for interactive demo
  const demoScenarios = [
    {
      industry: 'E-commerce',
      customer: 'Hi, I want to return my order #12345',
      ai: 'I\'d be happy to help with your return! Let me check order #12345. I see you purchased a blue t-shirt 3 days ago. Since it\'s within our 30-day return window, I can process this return for you. Would you like a refund or exchange?',
      metrics: { responseTime: '0.8s', confidence: '98%', satisfaction: '4.9/5' }
    },
    {
      industry: 'Healthcare',
      customer: 'What are your clinic hours this week?',
      ai: 'Our clinic hours this week are Monday-Friday 8AM-6PM, Saturday 9AM-2PM. We\'re closed Sunday. Would you like to schedule an appointment? I can check availability for you.',
      metrics: { responseTime: '0.6s', confidence: '99%', satisfaction: '4.8/5' }
    },
    {
      industry: 'Education',
      customer: 'How do I access my course materials?',
      ai: 'You can access your course materials through our student portal. I\'ll send you the direct link. Your login credentials are the same as your registration email. Need help with anything specific in your course?',
      metrics: { responseTime: '1.2s', confidence: '96%', satisfaction: '4.7/5' }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoScenarios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [demoScenarios.length]);

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
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600 animate-pulse" />
              <span className="ml-2 text-xl font-bold text-gray-900">WhatsApp AI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700">Get Started Free</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#demo" className="block text-gray-600 hover:text-gray-900">Demo</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900">Contact</a>
              <div className="pt-3 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pb-16 lg:pb-20 xl:pb-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Left Column - Content */}
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                <span className="block">Transform Your</span>
                <span className="block text-green-600">WhatsApp Into an</span>
                <span className="block">AI-Powered Customer</span>
                <span className="block text-green-600">Support Engine</span>
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                Automate responses, manage conversations, and delight customers 24/7 with intelligent AI that learns your business
              </p>

              {/* Value Propositions */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {valueProps.map((prop, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <prop.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{prop.title}</h3>
                      <p className="text-sm text-gray-600">{prop.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
              </div>
            </div>

            {/* Right Column - Interactive Demo */}
            <div className="mt-12 lg:mt-0 lg:col-span-6" id="demo">
              <div className="relative">
                {/* Demo Container */}
                <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Phone Header */}
                  <div className="bg-gray-800 px-4 py-3 flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-white text-sm font-medium">WhatsApp Business</span>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="bg-gray-100 p-4 h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Industry Selector */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-full p-1 shadow-sm">
                          <div className="flex space-x-1">
                            {demoScenarios.map((scenario, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentDemo(index)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  currentDemo === index 
                                    ? 'bg-green-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {scenario.industry}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Customer Message */}
                      <div className="flex justify-end">
                        <div className="bg-green-500 text-white rounded-lg px-4 py-2 max-w-xs">
                          <p className="text-sm">{demoScenarios[currentDemo].customer}</p>
                          <span className="text-xs opacity-75">2:34 PM</span>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-600">AI Assistant</span>
                          </div>
                          <p className="text-sm text-gray-900">{demoScenarios[currentDemo].ai}</p>
                          <span className="text-xs text-gray-500">2:34 PM</span>
                        </div>
                      </div>

                      {/* Metrics Overlay */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">AI Performance</h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Response Time</p>
                            <p className="font-semibold text-sm">{demoScenarios[currentDemo].metrics.responseTime}</p>
                          </div>
                          <div>
                            <Brain className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Confidence</p>
                            <p className="font-semibold text-sm">{demoScenarios[currentDemo].metrics.confidence}</p>
                          </div>
                          <div>
                            <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Satisfaction</p>
                            <p className="font-semibold text-sm">{demoScenarios[currentDemo].metrics.satisfaction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Join 10,000+ businesses already using WhatsApp AI
            </h2>
            
            {/* Customer Logos */}
            <div className="flex justify-center items-center space-x-8 opacity-60 mb-12">
              <div className="text-xl font-bold text-gray-600">TechCorp</div>
              <div className="text-xl font-bold text-gray-600">E-commerce+</div>
              <div className="text-xl font-bold text-gray-600">HealthCare</div>
              <div className="text-xl font-bold text-gray-600">EduPlatform</div>
              <div className="text-xl font-bold text-gray-600">RetailPro</div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 bg-white shadow-sm">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need for WhatsApp automation
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Our comprehensive platform covers every aspect of AI-powered customer support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureColumns.map((column, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our simple setup process
            </p>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 left-0 h-0.5 bg-green-500 transform -translate-y-1/2" style={{width: '75%'}}></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 relative z-10">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative p-6 ${tier.popular ? 'border-green-500 border-2' : 'border-gray-200'}`}>
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              ✓ No credit card required • ✓ 14-day free trial • ✓ Setup in under 10 minutes
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about WhatsApp AI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of businesses using WhatsApp AI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Start Your Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Schedule a Demo
            </Button>
          </div>
          
          <div className="flex justify-center space-x-8 text-green-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Setup in under 10 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <span className="ml-2 text-xl font-bold">WhatsApp AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transform your customer support with AI-powered WhatsApp automation.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; 2024 WhatsApp AI Assistant. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}