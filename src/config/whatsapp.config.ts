import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    baseUrl: process.env.MSG91_BASE_URL || 'https://api.msg91.com/api',
    webhookSecret: process.env.MSG91_WEBHOOK_SECRET,
    senderId: process.env.MSG91_SENDER_ID,
    timeout: parseInt(process.env.MSG91_TIMEOUT) || 30000,
    retries: parseInt(process.env.MSG91_RETRIES) || 3,
    retryDelay: parseInt(process.env.MSG91_RETRY_DELAY) || 1000,
  },
  webhook: {
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 30000,
    maxPayloadSize: process.env.WEBHOOK_MAX_PAYLOAD_SIZE || '1mb',
    rateLimiting: {
      windowMs: parseInt(process.env.WEBHOOK_RATE_WINDOW) || 60000,
      max: parseInt(process.env.WEBHOOK_RATE_MAX) || 100,
    },
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 3600,
    conversationTimeout: parseInt(process.env.CONVERSATION_TIMEOUT) || 86400,
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 1000,
  },
  features: {
    quickReplies: process.env.ENABLE_QUICK_REPLIES !== 'false',
    richMessages: process.env.ENABLE_RICH_MESSAGES !== 'false',
    mediaMessages: process.env.ENABLE_MEDIA_MESSAGES !== 'false',
    groupMessages: process.env.ENABLE_GROUP_MESSAGES === 'true',
  },
}));