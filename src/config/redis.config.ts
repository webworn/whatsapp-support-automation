import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB) || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'whatsapp:',
  retryDelayOnFailover: 100,
  retryDelayOnClusterDown: 300,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}));