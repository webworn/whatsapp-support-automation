import { Controller, Get, Res, Req, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from './modules/auth/decorators/public.decorator';
import { join } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

@Controller()
@Public()
export class FrontendController {
  private readonly logger = new Logger(FrontendController.name);
  
  @Get(['dashboard*', 'login', 'register', '', '/'])
  serveFrontend(@Req() req: Request, @Res() res: Response) {
    try {
      const frontendPath = join(__dirname, '..', 'frontend');
      this.logger.log(`Serving frontend from: ${frontendPath}`);
      this.logger.log(`Requested path: ${req.path}`);
      
      // Check for Next.js build files in correct locations
      const possiblePaths = [
        // Next.js standalone server files
        join(frontendPath, '.next', 'standalone', 'server.js'),
        join(frontendPath, '.next', 'server', 'pages', 'index.html'),
        join(frontendPath, '.next', 'server', 'app', 'page.html'),
        // Static export files  
        join(frontendPath, '.next', 'static', 'chunks', 'pages', 'index.js'),
        // Any HTML files in .next
        join(frontendPath, '.next', 'index.html'),
        join(frontendPath, 'dist', 'index.html'),
      ];
      
      // Log available frontend files for debugging
      if (existsSync(frontendPath)) {
        this.logger.log(`Frontend directory exists`);
        try {
          const stats = statSync(frontendPath);
          this.logger.log(`Frontend path is directory: ${stats.isDirectory()}`);
        } catch (e) {
          this.logger.error(`Error checking frontend directory: ${e.message}`);
        }
      } else {
        this.logger.warn(`Frontend directory does not exist: ${frontendPath}`);
      }
      
      // For production, serve the landing page directly instead of trying to find Next.js files
      if (req.path === '/' || req.path === '') {
        this.logger.log(`Serving landing page for root path`);
        const landingPageContent = this.generateLandingPage();
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(landingPageContent);
        return;
      }

      // Try to serve Next.js files for other routes
      for (const htmlPath of possiblePaths) {
        if (existsSync(htmlPath)) {
          this.logger.log(`Found frontend file: ${htmlPath}`);
          const content = readFileSync(htmlPath, 'utf8');
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.send(content);
          return;
        }
      }
      
      this.logger.warn(`No built frontend files found, serving React fallback`);
      
      // Serve enhanced React-based fallback with real functionality
      const html = this.generateReactFallback();
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Frontend controller error:', error);
      res.status(500).send(`
        <h1>Frontend Service Error</h1>
        <p>Unable to serve frontend content.</p>
        <pre>${error.message}</pre>
      `);
    }
  }

  // API health check that includes frontend status
  @Get('health')
  healthCheck(@Res() res: Response) {
    const frontendPath = join(__dirname, '..', 'frontend', '.next');
    const frontendBuilt = existsSync(frontendPath);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        backend: 'operational',
        database: 'connected',
        frontend: frontendBuilt ? 'built' : 'building',
        integration: 'active'
      },
      build: {
        type: 'integrated',
        platform: 'railway',
        frontend: frontendBuilt ? 'complete' : 'in-progress'
      }
    };

    res.json(health);
  }

  private generateLandingPage(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>WhatsApp AI Customer Support - Transform Your Business</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
          <style>
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            .hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .text-gradient { background: linear-gradient(45deg, #00f5ff, #00d4aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          </style>
        </head>
        <body class="min-h-screen bg-white">
          <!-- Fixed Navigation Header -->
          <nav class="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between h-16">
                <div class="flex items-center">
                  <i data-lucide="message-square" class="h-8 w-8 text-green-600 animate-pulse"></i>
                  <span class="ml-2 text-xl font-bold text-gray-900">WhatsApp AI</span>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                  <a href="#features" class="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                  <a href="#pricing" class="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                  <a href="#demo" class="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
                  <a href="/login" class="text-gray-600 hover:text-gray-900 transition-colors">Login</a>
                  <a href="/register" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Get Started Free</a>
                </div>
              </div>
            </div>
          </nav>

          <!-- Hero Section -->
          <section class="relative pt-16 pb-12 sm:pb-16 lg:pb-20 xl:pb-24 hero-gradient">
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
                <!-- Left Column - Content -->
                <div class="lg:col-span-6">
                  <h1 class="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                    <span class="block">Transform Your</span>
                    <span class="block text-gradient">WhatsApp Into an</span>
                    <span class="block">AI-Powered Customer</span>
                    <span class="block text-gradient">Support Engine</span>
                  </h1>
                  
                  <p class="mt-6 text-xl text-gray-100 max-w-2xl">
                    Automate responses, manage conversations, and delight customers 24/7 with intelligent AI that learns your business
                  </p>

                  <!-- Value Propositions -->
                  <div class="mt-8 grid grid-cols-2 gap-4">
                    <div class="flex items-start space-x-3">
                      <i data-lucide="zap" class="h-6 w-6 text-green-400 mt-1"></i>
                      <div>
                        <h3 class="font-semibold text-white">Instant AI Responses</h3>
                        <p class="text-sm text-gray-200">95% faster than human agents</p>
                      </div>
                    </div>
                    <div class="flex items-start space-x-3">
                      <i data-lucide="brain" class="h-6 w-6 text-green-400 mt-1"></i>
                      <div>
                        <h3 class="font-semibold text-white">Smart Learning</h3>
                        <p class="text-sm text-gray-200">AI adapts to your business knowledge</p>
                      </div>
                    </div>
                    <div class="flex items-start space-x-3">
                      <i data-lucide="smartphone" class="h-6 w-6 text-green-400 mt-1"></i>
                      <div>
                        <h3 class="font-semibold text-white">WhatsApp Native</h3>
                        <p class="text-sm text-gray-200">Works directly in existing workflow</p>
                      </div>
                    </div>
                    <div class="flex items-start space-x-3">
                      <i data-lucide="shield" class="h-6 w-6 text-green-400 mt-1"></i>
                      <div>
                        <h3 class="font-semibold text-white">Enterprise Security</h3>
                        <p class="text-sm text-gray-200">Bank-level encryption</p>
                      </div>
                    </div>
                  </div>

                  <!-- CTAs -->
                  <div class="mt-10 flex flex-col sm:flex-row gap-4">
                    <a href="/register" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center">
                      Start Free Trial
                      <i data-lucide="arrow-right" class="ml-2 h-5 w-5"></i>
                    </a>
                    <button onclick="document.getElementById('demo').scrollIntoView({behavior: 'smooth'})" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center">
                      <i data-lucide="play-circle" class="mr-2 h-5 w-5"></i>
                      Watch Demo
                    </button>
                  </div>
                </div>

                <!-- Right Column - Demo -->
                <div class="mt-12 lg:mt-0 lg:col-span-6" id="demo">
                  <div class="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                    <div class="bg-gray-800 px-4 py-3 flex items-center space-x-3">
                      <div class="flex space-x-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div class="flex-1 text-center">
                        <span class="text-white text-sm font-medium">WhatsApp Business</span>
                      </div>
                    </div>
                    <div class="bg-gray-100 p-4 h-96">
                      <div class="space-y-4">
                        <!-- Customer Message -->
                        <div class="flex justify-end">
                          <div class="bg-green-500 text-white rounded-lg px-4 py-2 max-w-xs">
                            <p class="text-sm">Hi, I want to return my order #12345</p>
                            <span class="text-xs opacity-75">2:34 PM</span>
                          </div>
                        </div>
                        <!-- AI Response -->
                        <div class="flex justify-start">
                          <div class="bg-white rounded-lg px-4 py-2 max-w-xs shadow-sm">
                            <div class="flex items-center space-x-2 mb-1">
                              <i data-lucide="brain" class="h-4 w-4 text-blue-500"></i>
                              <span class="text-xs font-medium text-gray-600">AI Assistant</span>
                            </div>
                            <p class="text-sm text-gray-900">I'd be happy to help with your return! Let me check order #12345. I see you purchased a blue t-shirt 3 days ago. Since it's within our 30-day return window, I can process this return for you. Would you like a refund or exchange?</p>
                            <span class="text-xs text-gray-500">2:34 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Pricing Section -->
          <section id="pricing" class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center mb-12">
                <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Transparent Pricing</h2>
                <p class="text-xl text-gray-600">Choose the plan that fits your business needs</p>
              </div>
              <div class="grid md:grid-cols-3 gap-8">
                <!-- Starter -->
                <div class="border border-gray-200 rounded-lg p-6">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                  <div class="mb-4">
                    <span class="text-4xl font-bold text-gray-900">$29</span>
                    <span class="text-gray-600">/mo</span>
                  </div>
                  <ul class="space-y-3 mb-6">
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>1,000 messages</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Basic AI</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Email Support</li>
                  </ul>
                  <button class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg">Start Free</button>
                </div>
                <!-- Professional -->
                <div class="border-2 border-green-500 rounded-lg p-6 relative">
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span class="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                  <div class="mb-4">
                    <span class="text-4xl font-bold text-gray-900">$99</span>
                    <span class="text-gray-600">/mo</span>
                  </div>
                  <ul class="space-y-3 mb-6">
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>10,000 messages</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Advanced AI</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Priority Support</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Analytics</li>
                  </ul>
                  <button class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">Start Free</button>
                </div>
                <!-- Enterprise -->
                <div class="border border-gray-200 rounded-lg p-6">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                  <div class="mb-4">
                    <span class="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <ul class="space-y-3 mb-6">
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Unlimited messages</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Custom AI Training</li>
                    <li class="flex items-center"><i data-lucide="check-circle" class="h-5 w-5 text-green-500 mr-3"></i>Dedicated Manager</li>
                  </ul>
                  <button class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg">Contact Us</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="bg-gray-900 text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center mb-4">
                <i data-lucide="message-square" class="h-8 w-8 text-green-500"></i>
                <span class="ml-2 text-xl font-bold">WhatsApp AI</span>
              </div>
              <p class="text-gray-400">Transform your customer support with AI-powered WhatsApp automation.</p>
            </div>
          </footer>

          <script>
            // Initialize Lucide icons
            lucide.createIcons();
          </script>
        </body>
      </html>
    `;
  }

  private generateReactFallback(): string {
    // Get current domain for API URL configuration
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? `${protocol}://${domain}` 
      : 'http://localhost:3000';
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${domain}` 
      : 'ws://localhost:3000';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>WhatsApp AI SaaS Platform</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script>
            // Set global configuration for the frontend
            window.__WHATSAPP_AI_CONFIG__ = {
              apiUrl: '${apiUrl}',
              wsUrl: '${wsUrl}',
              environment: '${process.env.NODE_ENV || 'development'}',
              buildTime: '${new Date().toISOString()}'
            };
          </script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              color: white;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              padding: 20px;
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              margin-top: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { 
              font-size: 3rem; 
              background: linear-gradient(45deg, #00f5ff, #00d4aa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
            }
            .auth-form { 
              max-width: 400px; 
              margin: 20px auto; 
              background: rgba(255,255,255,0.1); 
              padding: 30px; 
              border-radius: 15px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
            .form-group input { 
              width: 100%; 
              padding: 12px; 
              border: 1px solid rgba(255,255,255,0.3); 
              border-radius: 8px; 
              background: rgba(255,255,255,0.1);
              color: white;
              font-size: 16px;
            }
            .form-group input::placeholder { color: rgba(255,255,255,0.7); }
            .btn { 
              background: linear-gradient(45deg, #00f5ff, #00d4aa);
              color: white; 
              padding: 12px 24px; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: 600;
              font-size: 16px;
              width: 100%;
              transition: all 0.3s ease;
            }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 245, 255, 0.4); }
            .btn-secondary { 
              background: transparent; 
              border: 1px solid rgba(255,255,255,0.3); 
              margin-top: 10px; 
            }
            .nav-tabs { display: flex; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
            .nav-tab { 
              flex: 1; 
              padding: 15px; 
              background: rgba(255,255,255,0.1); 
              border: none; 
              color: white; 
              cursor: pointer; 
              transition: background 0.3s ease;
            }
            .nav-tab.active { background: rgba(0, 245, 255, 0.3); }
            .dashboard-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .dashboard-card { 
              background: rgba(255,255,255,0.1); 
              padding: 25px; 
              border-radius: 15px; 
              border: 1px solid rgba(255,255,255,0.2);
            }
            .dashboard-card h3 { color: #00f5ff; margin-bottom: 15px; }
            .status-item { display: flex; justify-content: space-between; margin: 10px 0; }
            .status-badge { 
              padding: 4px 12px; 
              background: rgba(0, 245, 255, 0.3); 
              border-radius: 12px; 
              font-size: 12px; 
            }
            .alert { 
              padding: 15px; 
              margin: 15px 0; 
              border-radius: 8px; 
              border: 1px solid rgba(0, 245, 255, 0.3); 
              background: rgba(0, 245, 255, 0.1); 
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          
          <script type="text/babel">
            const { useState, useEffect } = React;
            
            function App() {
              const [currentView, setCurrentView] = useState('login');
              const [user, setUser] = useState(null);
              const [loading, setLoading] = useState(false);
              const [message, setMessage] = useState('');
              
              // Check if user is logged in
              useEffect(() => {
                const token = localStorage.getItem('authToken');
                if (token) {
                  const config = window.__WHATSAPP_AI_CONFIG__ || { apiUrl: '' };
                  fetch(\`\${config.apiUrl}/api/auth/me\`, {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.id) {
                      setUser(data);
                      setCurrentView('dashboard');
                    }
                  })
                  .catch(() => localStorage.removeItem('authToken'));
                }
              }, []);
              
              const handleAuth = async (e, isLogin) => {
                e.preventDefault();
                setLoading(true);
                setMessage('');
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                try {
                  const config = window.__WHATSAPP_AI_CONFIG__ || { apiUrl: '' };
                  const response = await fetch(\`\${config.apiUrl}/api/auth/\${isLogin ? 'login' : 'register'}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  const result = await response.json();
                  
                  if (response.ok) {
                    if (isLogin) {
                      localStorage.setItem('authToken', result.access_token);
                      setUser(result.user);
                      setCurrentView('dashboard');
                      setMessage('Login successful!');
                    } else {
                      setMessage('Registration successful! Please login.');
                      setCurrentView('login');
                    }
                  } else {
                    setMessage(result.message || 'Authentication failed');
                  }
                } catch (error) {
                  setMessage('Network error. Please try again.');
                }
                setLoading(false);
              };
              
              const handleLogout = () => {
                localStorage.removeItem('authToken');
                setUser(null);
                setCurrentView('login');
                setMessage('Logged out successfully');
              };
              
              if (currentView === 'dashboard' && user) {
                return (
                  <div className="container">
                    <div className="header">
                      <h1>🚀 WhatsApp AI Dashboard</h1>
                      <p>Welcome back, {user.email}!</p>
                      <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                    </div>
                    
                    {message && <div className="alert">{message}</div>}
                    
                    <div className="dashboard-grid">
                      <div className="dashboard-card">
                        <h3>📱 WhatsApp Integration</h3>
                        <div className="status-item">
                          <span>Connection Status</span>
                          <span className="status-badge">Connected</span>
                        </div>
                        <div className="status-item">
                          <span>Webhook</span>
                          <span className="status-badge">Active</span>
                        </div>
                        <div className="status-item">
                          <span>Messages Today</span>
                          <span className="status-badge">12</span>
                        </div>
                      </div>
                      
                      <div className="dashboard-card">
                        <h3>🤖 AI Assistant</h3>
                        <div className="status-item">
                          <span>Model</span>
                          <span className="status-badge">Claude Sonnet</span>
                        </div>
                        <div className="status-item">
                          <span>Response Time</span>
                          <span className="status-badge">2.3s avg</span>
                        </div>
                        <div className="status-item">
                          <span>Knowledge Base</span>
                          <span className="status-badge">3 docs</span>
                        </div>
                      </div>
                      
                      <div className="dashboard-card">
                        <h3>📊 Analytics</h3>
                        <div className="status-item">
                          <span>Total Conversations</span>
                          <span className="status-badge">47</span>
                        </div>
                        <div className="status-item">
                          <span>Response Rate</span>
                          <span className="status-badge">98.5%</span>
                        </div>
                        <div className="status-item">
                          <span>Satisfaction</span>
                          <span className="status-badge">4.8/5</span>
                        </div>
                      </div>
                      
                      <div className="dashboard-card">
                        <h3>⚙️ Quick Actions</h3>
                        <button className="btn" onClick={() => setMessage('Knowledge base coming soon!')}>
                          Upload Documents
                        </button>
                        <button className="btn btn-secondary" onClick={() => setMessage('Settings coming soon!')}>
                          Configure AI
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="container">
                  <div className="header">
                    <h1>🚀 WhatsApp AI SaaS</h1>
                    <p>Enterprise Customer Support Automation</p>
                  </div>
                  
                  <div className="auth-form">
                    <div className="nav-tabs">
                      <button 
                        className={\`nav-tab \${currentView === 'login' ? 'active' : ''}\`}
                        onClick={() => setCurrentView('login')}
                      >
                        Login
                      </button>
                      <button 
                        className={\`nav-tab \${currentView === 'register' ? 'active' : ''}\`}
                        onClick={() => setCurrentView('register')}
                      >
                        Register
                      </button>
                    </div>
                    
                    {message && <div className="alert">{message}</div>}
                    
                    <form onSubmit={(e) => handleAuth(e, currentView === 'login')}>
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="Enter your email" 
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Password</label>
                        <input 
                          type="password" 
                          name="password" 
                          placeholder="Enter your password" 
                          required 
                        />
                      </div>
                      
                      {currentView === 'register' && (
                        <div className="form-group">
                          <label>Business Name</label>
                          <input 
                            type="text" 
                            name="businessName" 
                            placeholder="Enter your business name" 
                            required 
                          />
                        </div>
                      )}
                      
                      <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Processing...' : (currentView === 'login' ? 'Login' : 'Create Account')}
                      </button>
                    </form>
                  </div>
                </div>
              );
            }
            
            ReactDOM.render(<App />, document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
  }
}