// src/config/app.config.ts - Application Configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
    port: number;
    debug: boolean;
  };
  cors: {
    origins: string | string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  ai: {
    openrouter: {
      apiKey: string;
      baseUrl: string;
      primaryModel: string;
      fallbackModel: string;
      maxTokens: number;
      timeout: number;
    };
  };
  whatsapp: {
    msg91: {
      authKey: string;
      webhookSecret: string;
      senderId: string;
      baseUrl: string;
    };
    business: {
      verifyToken: string;
      accessToken: string;
      phoneNumberId: string;
      appSecret: string;
      businessAccountId: string;
    };
  };
  redis: {
    url: string;
    sessionTimeout: number;
    conversationTimeout: number;
  };
  database: {
    url: string;
  };
  logging: {
    level: string;
    format: string;
  };
  security: {
    webhookTimeout: number;
    enableMetrics: boolean;
    metricsPort: number;
  };
}

const requiredEnvVars = [
  'OPENROUTER_API_KEY'
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  // Don't exit in production - allow demo mode
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Running in demo mode due to missing environment variables');
  }
}

export const config: AppConfig = {
  app: {
    name: 'WhatsApp Support Automation',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    debug: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  },

  ai: {
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      primaryModel: process.env.OPENROUTER_PRIMARY_MODEL || 'anthropic/claude-3-haiku',
      fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-3.5-turbo',
      maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '500', 10),
      timeout: parseInt(process.env.OPENROUTER_TIMEOUT || '30000', 10),
    },
  },

  whatsapp: {
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || 'placeholder-auth-key',
      webhookSecret: process.env.MSG91_WEBHOOK_SECRET || 'placeholder-webhook-secret',
      senderId: process.env.MSG91_SENDER_ID || 'placeholder-sender-id',
      baseUrl: process.env.MSG91_BASE_URL || 'https://api.msg91.com/api',
    },
    business: {
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      appSecret: process.env.WHATSAPP_APP_SECRET || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10),
    conversationTimeout: parseInt(process.env.CONVERSATION_TIMEOUT || '86400', 10),
  },

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  security: {
    webhookTimeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000', 10),
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  },
};

// Configuration validation
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.ai.openrouter.apiKey && config.app.environment === 'production') {
    errors.push('OPENROUTER_API_KEY is required for production');
  }

  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  if (config.rateLimit.max < 1) {
    errors.push('RATE_LIMIT_MAX must be greater than 0');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}

// Export individual config sections for easier imports
export const { app: appConfig } = config;
export const { ai: aiConfig } = config;
export const { whatsapp: whatsappConfig } = config;
export const { database: databaseConfig } = config;
export const { redis: redisConfig } = config;