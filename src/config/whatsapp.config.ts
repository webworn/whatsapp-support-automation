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
  business: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    baseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com',
    version: process.env.WHATSAPP_API_VERSION || 'v18.0',
    timeout: parseInt(process.env.WHATSAPP_API_TIMEOUT) || 30000,
    retries: parseInt(process.env.WHATSAPP_API_RETRIES) || 3,
    retryDelay: parseInt(process.env.WHATSAPP_API_RETRY_DELAY) || 2000,
    // Test credentials
    testAccessToken: process.env.TEST_ACCESS_TOKEN,
    testPhoneNumberId: process.env.TEST_PHONE_NUMBER_ID,
    testVerifyToken: process.env.TEST_VERIFY_TOKEN,
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
    businessApi: process.env.ENABLE_WHATSAPP_BUSINESS_API !== 'false',
  },
  testing: {
    enabled: process.env.TEST_MODE_ENABLED === 'true' || process.env.WHATSAPP_TEST_MODE === 'true',
    testNumber: process.env.WHATSAPP_TEST_NUMBER || '+15556485637',
    testPhoneNumberId: process.env.TEST_PHONE_NUMBER_ID || '665397593326012',
    testBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1437200930610622',
    allowedTestNumbers: [
      '+15556485637', // Meta's official test number
      process.env.WHATSAPP_TEST_NUMBER,
    ].filter(Boolean),
    testSessionTimeout: parseInt(process.env.TEST_SESSION_TIMEOUT) || 3600, // 1 hour
    maxTestMessages: parseInt(process.env.MAX_TEST_MESSAGES) || 50, // per session
  },
}));