// src/app.ts - Main Application Entry Point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Core Services
import { UserProfiler } from './services/user-profiling.service';
import { TokenOptimizer } from './services/token-optimizer.service';
import { MSG91Integration } from './integrations/msg91.integration';
import { WhatsAppBusinessWebhook } from './integrations/whatsapp-business.integration';

// Routes
import { webhookRoutes } from './routes/webhook.routes';
import { adminRoutes } from './routes/admin.routes';
import { testingRoutes } from './routes/testing.routes';
import { healthRoutes } from './routes/health.routes';

// Middleware
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { webhookValidator } from './middleware/webhook-validator.middleware';

// Configuration
import { config } from './config/app.config';
import { logger } from './utils/logger.util';

export class WhatsAppSupportApp {
  public app: express.Application;
  public userProfiler: UserProfiler;
  public tokenOptimizer: TokenOptimizer;
  public msg91: MSG91Integration;
  public whatsappBusiness: WhatsAppBusinessWebhook;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeServices(): void {
    this.userProfiler = new UserProfiler();
    this.tokenOptimizer = new TokenOptimizer();
    this.msg91 = new MSG91Integration();
    this.whatsappBusiness = new WhatsAppBusinessWebhook();

    logger.info('🚀 Core services initialized');
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Performance middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    logger.info('🛡️ Security and performance middleware configured');
  }

  private initializeRoutes(): void {
    // API versioning
    const apiV1 = express.Router();

    // Mount route handlers
    apiV1.use('/health', healthRoutes);
    apiV1.use('/webhook', webhookValidator, webhookRoutes(this.getServices()));
    apiV1.use('/admin', adminRoutes(this.getServices()));
    apiV1.use('/test', testingRoutes(this.getServices()));

    // Mount API version
    this.app.use('/api/v1', apiV1);

    // Root endpoint with API documentation
    this.app.get('/', (req, res) => {
      res.json({
        name: 'WhatsApp Support Automation API',
        version: config.app.version,
        status: 'running',
        environment: config.app.environment,
        company: 'TechCorp Solutions',
        features: [
          'AI Integration with Dynamic Prompts',
          'WhatsApp Business API Support',
          'MSG91 Enterprise Integration',
          'User Profiling & Personalization',
          'Token Optimization (40-70% savings)',
          'Webhook Security & Validation',
          'Interactive Message Support',
          'Real-time Analytics Dashboard'
        ],
        endpoints: {
          health: 'GET /api/v1/health',
          webhooks: {
            msg91: 'POST /api/v1/webhook/whatsapp',
            whatsappBusiness: 'POST /api/v1/webhook/whatsapp-business'
          },
          admin: {
            conversations: 'GET /api/v1/admin/conversations',
            users: 'GET /api/v1/admin/users',
            analytics: 'GET /api/v1/admin/analytics',
            testing: 'POST /api/v1/admin/test-integration'
          },
          testing: {
            simulate: 'POST /api/v1/test/simulate-webhook',
            personalization: 'POST /api/v1/test/personalization',
            optimization: 'POST /api/v1/test/token-optimization'
          }
        },
        integrationStatus: {
          msg91: this.msg91.getConfigurationStatus(),
          whatsappBusiness: this.whatsappBusiness.getConfigurationStatus()
        },
        documentation: 'https://github.com/webworn/whatsapp-support-automation'
      });
    });

    logger.info('📍 API routes configured with versioning');
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: '/api/v1'
      });
    });

    // Global error handler
    this.app.use(errorHandler);

    logger.info('🚨 Error handling configured');
  }

  private getServices() {
    return {
      userProfiler: this.userProfiler,
      tokenOptimizer: this.tokenOptimizer,
      msg91: this.msg91,
      whatsappBusiness: this.whatsappBusiness
    };
  }

  public listen(): void {
    const port = config.app.port;
    
    this.app.listen(port, () => {
      logger.info(`🚀 WhatsApp Support Automation Server started`);
      logger.info(`🌐 Environment: ${config.app.environment}`);
      logger.info(`📡 Port: ${port}`);
      logger.info(`🔗 Base URL: http://localhost:${port}/api/v1`);
      logger.info(`📚 API Documentation: http://localhost:${port}/`);
      
      // Service status
      const msg91Status = this.msg91.getConfigurationStatus();
      const whatsappStatus = this.whatsappBusiness.getConfigurationStatus();
      
      logger.info(`📱 WhatsApp Integrations:`);
      logger.info(`   MSG91: ${msg91Status.isDemo ? '⚠️ Demo Mode' : '✅ Production Ready'}`);
      logger.info(`   Business API: ${whatsappStatus.isDemo ? '⚠️ Demo Mode' : '✅ Production Ready'}`);
      logger.info(`🧠 AI Features: Personalization, Optimization, Context-Aware Responses`);
      logger.info(`💰 Cost Optimization: 40-70% token savings enabled`);
      
      logger.info('✅ Server ready for production traffic');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}