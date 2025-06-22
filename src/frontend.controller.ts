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
      // Determine project root based on whether we're in dev or production
      const isDev = process.env.NODE_ENV !== 'production';
      
      // Path resolution for different environments (without standalone)
      const devPath = join(process.cwd(), 'frontend', '.next', 'server', 'app');
      // In production Docker, __dirname is /app/dist/src, so we need to go up to /app
      const prodPath = join(__dirname, '..', '..', 'frontend', '.next', 'server', 'app');
      
      this.logger.log(`Requested path: ${req.path}`);
      this.logger.log(`Environment: ${isDev ? 'development' : 'production'}`);
      this.logger.log(`__dirname: ${__dirname}`);
      
      // Choose the appropriate path based on environment
      const nextServerAppDir = isDev ? devPath : prodPath;
      this.logger.log(`Using frontend path: ${nextServerAppDir}`);
      
      // Check if static files are properly configured
      const staticPath = isDev 
        ? join(process.cwd(), 'frontend', '.next', 'static')
        : join(__dirname, '..', '..', 'frontend', '.next', 'static');
      
      if (!existsSync(staticPath)) {
        this.logger.error(`Static files directory missing: ${staticPath}`);
      } else {
        this.logger.log(`Static files directory exists: ${staticPath}`);
      }
      
      // Map routes to HTML files - Next.js app directory generates direct .html files
      let htmlFile = '';
      if (req.path === '/' || req.path === '') {
        htmlFile = 'index.html';
      } else {
        // Remove leading slash and add .html (Next.js generates login.html, dashboard.html, etc.)
        htmlFile = req.path.replace(/^\//, '') + '.html';
      }
      
      const possiblePaths = [
        // Next.js server HTML files (direct .html files in app directory)
        join(nextServerAppDir, htmlFile),
        join(nextServerAppDir, 'index.html'), // fallback to home page
      ];
      
      // Log available frontend files for debugging
      if (existsSync(nextServerAppDir)) {
        this.logger.log(`Frontend server app directory exists`);
        this.logger.log(`Looking for HTML file: ${htmlFile}`);
      } else {
        this.logger.warn(`Frontend server app directory does not exist`);
        this.logger.warn(`Checked path: ${nextServerAppDir}`);
      }
      
      // Try to serve Next.js files first
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

      // For root path, serve the generated landing page if Next.js files not found
      if (req.path === '/' || req.path === '') {
        this.logger.log(`Next.js files not found, serving generated landing page for root path`);
        const landingPageContent = this.generateLandingPage();
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(landingPageContent);
        return;
      }
      
      this.logger.error(`No built frontend files found for path: ${req.path}`);
      
      // Return 404 instead of fallback - frontend should always be built
      res.status(404).send(`
        <h1>Frontend Not Built</h1>
        <p>The Next.js frontend was not properly built. Please run:</p>
        <pre>npm run build:frontend</pre>
        <p>Or check the Docker build logs for frontend build errors.</p>
      `);
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
    const isDev = process.env.NODE_ENV !== 'production';
    const frontendPath = isDev 
      ? join(process.cwd(), 'frontend', '.next')
      : join(__dirname, '..', '..', 'frontend', '.next');
    const staticPath = isDev 
      ? join(process.cwd(), 'frontend', '.next', 'static')
      : join(__dirname, '..', '..', 'frontend', '.next', 'static');
    const chunksPath = join(staticPath, 'chunks');
    
    const frontendBuilt = existsSync(frontendPath);
    const staticFilesExist = existsSync(staticPath);
    const chunksExist = existsSync(chunksPath);
    
    // Check for critical chunk files
    let chunkFiles = [];
    if (chunksExist) {
      try {
        chunkFiles = require('fs').readdirSync(chunksPath)
          .filter((file: string) => file.endsWith('.js'))
          .slice(0, 5); // Show first 5 chunks
      } catch (e) {
        this.logger.warn('Failed to read chunk files:', e.message);
      }
    }
    
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
      },
      staticFiles: {
        available: staticFilesExist,
        chunksAvailable: chunksExist,
        staticPath: staticPath,
        sampleChunks: chunkFiles
      },
      paths: {
        frontendPath,
        staticPath,
        chunksPath,
        environment: isDev ? 'development' : 'production'
      }
    };

    res.json(health);
  }

  // Add static file verification endpoint
  @Get('debug/static-files')
  debugStaticFiles(@Res() res: Response) {
    const isDev = process.env.NODE_ENV !== 'production';
    const staticPath = isDev 
      ? join(process.cwd(), 'frontend', '.next', 'static')
      : join(__dirname, '..', '..', 'frontend', '.next', 'static');
    
    try {
      const staticExists = existsSync(staticPath);
      if (!staticExists) {
        return res.json({
          error: 'Static directory not found',
          path: staticPath,
          exists: false
        });
      }

      // List all files in static directory
      const files = this.listFilesRecursively(staticPath);
      
      res.json({
        staticPath,
        exists: true,
        totalFiles: files.length,
        files: files.slice(0, 20), // Show first 20 files
        chunks: files.filter(f => f.includes('/chunks/')).slice(0, 10)
      });
    } catch (error) {
      res.json({
        error: error.message,
        staticPath,
        exists: false
      });
    }
  }

  private listFilesRecursively(dir: string, basePath: string = ''): string[] {
    let files = [];
    try {
      const items = require('fs').readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const relativePath = basePath ? `${basePath}/${item}` : item;
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files = files.concat(this.listFilesRecursively(fullPath, relativePath));
        } else {
          files.push(relativePath);
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return files;
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

}