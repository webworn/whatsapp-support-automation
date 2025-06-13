import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get('redis');
    
    const clientConfig = {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.database,
      keyPrefix: redisConfig.keyPrefix,
      retryDelayOnFailover: redisConfig.retryDelayOnFailover,
      retryDelayOnClusterDown: redisConfig.retryDelayOnClusterDown,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: redisConfig.lazyConnect,
      keepAlive: redisConfig.keepAlive,
      connectTimeout: redisConfig.connectTimeout,
      commandTimeout: redisConfig.commandTimeout,
    };

    try {
      // Main client for regular operations
      this.client = new Redis(clientConfig);
      
      // Dedicated connections for pub/sub
      this.subscriber = new Redis(clientConfig);
      this.publisher = new Redis(clientConfig);

      // Event handlers
      this.setupEventHandlers();

      // Connect all clients
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
      ]);

      this.logger.log('Redis clients connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await Promise.all([
        this.client?.quit(),
        this.subscriber?.quit(),
        this.publisher?.quit(),
      ]);
      this.logger.log('Redis clients disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting Redis clients', error);
    }
  }

  private setupEventHandlers() {
    const clients = [
      { client: this.client, name: 'main' },
      { client: this.subscriber, name: 'subscriber' },
      { client: this.publisher, name: 'publisher' },
    ];

    clients.forEach(({ client, name }) => {
      client.on('connect', () => {
        this.logger.log(`Redis ${name} client connected`);
      });

      client.on('ready', () => {
        this.logger.log(`Redis ${name} client ready`);
      });

      client.on('error', (error) => {
        this.logger.error(`Redis ${name} client error`, error);
      });

      client.on('close', () => {
        this.logger.warn(`Redis ${name} client disconnected`);
      });

      client.on('reconnecting', () => {
        this.logger.log(`Redis ${name} client reconnecting`);
      });
    });
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}`, error);
      return false;
    }
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Redis GET JSON error for key ${key}`, error);
      return null;
    }
  }

  async setJson(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const stringValue = JSON.stringify(value);
      return await this.set(key, stringValue, ttl);
    } catch (error) {
      this.logger.error(`Redis SET JSON error for key ${key}`, error);
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error for key ${key}, field ${field}`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      this.logger.error(`Redis HSET error for key ${key}, field ${field}`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for key ${key}`, error);
      return null;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Redis LPUSH error for key ${key}`, error);
      return 0;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      this.logger.error(`Redis RPOP error for key ${key}`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Redis LRANGE error for key ${key}`, error);
      return [];
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      this.logger.error(`Redis PUBLISH error for channel ${channel}`, error);
      return 0;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    } catch (error) {
      this.logger.error(`Redis SUBSCRIBE error for channel ${channel}`, error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      this.logger.error(`Redis UNSUBSCRIBE error for channel ${channel}`, error);
    }
  }

  // Utility methods
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async flushall(): Promise<boolean> {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      this.logger.error('Redis FLUSHALL error', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Redis KEYS error for pattern ${pattern}`, error);
      return [];
    }
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  getPublisher(): Redis {
    return this.publisher;
  }
}