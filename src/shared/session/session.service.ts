import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../database/prisma.service';
import { CreateSessionDto, UpdateSessionDto, SessionData, SessionResponseDto } from './dto/session.dto';
import { normalizePhoneNumber } from '../utils/phone.util';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionTimeout: number;
  private readonly conversationTimeout: number;
  private readonly maxConcurrentSessions: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.sessionTimeout = this.configService.get('whatsapp.session.timeout', 3600); // 1 hour
    this.conversationTimeout = this.configService.get('whatsapp.session.conversationTimeout', 86400); // 24 hours
    this.maxConcurrentSessions = this.configService.get('whatsapp.session.maxConcurrentSessions', 1000);
  }

  private getSessionKey(phoneNumber: string): string {
    return `session:${phoneNumber}`;
  }

  private getConversationKey(sessionId: string): string {
    return `conversation:${sessionId}`;
  }

  private getUserSessionsKey(phoneNumber: string): string {
    return `user_sessions:${phoneNumber}`;
  }

  async createSession(createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    const { phoneNumber, context = {} } = createSessionDto;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check for existing session
    const existingSession = await this.getSessionByPhone(normalizedPhone);
    if (existingSession) {
      this.logger.log(`Returning existing session for ${normalizedPhone}`);
      return existingSession;
    }

    // Check concurrent session limit
    await this.checkConcurrentSessionLimit();

    const sessionId = uuidv4();
    const now = Date.now();
    const expiresAt = now + (this.sessionTimeout * 1000);

    const sessionData: SessionData = {
      sessionId,
      phoneNumber: normalizedPhone,
      currentFlow: null,
      currentStep: null,
      context,
      messageCount: 0,
      createdAt: now,
      lastActivity: now,
      expiresAt,
    };

    try {
      // Store in Redis with TTL
      const sessionKey = this.getSessionKey(normalizedPhone);
      const conversationKey = this.getConversationKey(sessionId);

      await Promise.all([
        this.redisService.setJson(sessionKey, sessionData, this.sessionTimeout),
        this.redisService.setJson(conversationKey, sessionData, this.conversationTimeout),
      ]);

      // Store in database for persistence
      await this.prismaService.session.create({
        data: {
          id: sessionId,
          phoneNumber: normalizedPhone,
          sessionData: sessionData as any,
          lastActivity: new Date(now),
          expiresAt: new Date(expiresAt),
        },
      });

      // Track user sessions
      await this.addToUserSessions(normalizedPhone, sessionId);

      this.logger.log(`Created session ${sessionId} for ${normalizedPhone}`);

      return this.toResponseDto(sessionData);
    } catch (error) {
      this.logger.error(`Failed to create session for ${normalizedPhone}`, error);
      throw error;
    }
  }

  async getSessionByPhone(phoneNumber: string): Promise<SessionResponseDto | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const sessionKey = this.getSessionKey(normalizedPhone);

    try {
      let sessionData = await this.redisService.getJson<SessionData>(sessionKey);

      if (!sessionData) {
        // Try to restore from database
        sessionData = await this.restoreSessionFromDatabase(normalizedPhone);
      }

      if (!sessionData) {
        return null;
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.endSession(normalizedPhone);
        return null;
      }

      return this.toResponseDto(sessionData);
    } catch (error) {
      this.logger.error(`Failed to get session for ${normalizedPhone}`, error);
      return null;
    }
  }

  async getSessionById(sessionId: string): Promise<SessionResponseDto | null> {
    const conversationKey = this.getConversationKey(sessionId);

    try {
      const sessionData = await this.redisService.getJson<SessionData>(conversationKey);

      if (!sessionData) {
        return null;
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.endSessionById(sessionId);
        return null;
      }

      return this.toResponseDto(sessionData);
    } catch (error) {
      this.logger.error(`Failed to get session ${sessionId}`, error);
      return null;
    }
  }

  async updateSession(phoneNumber: string, updateDto: UpdateSessionDto): Promise<SessionResponseDto> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const sessionKey = this.getSessionKey(normalizedPhone);

    const sessionData = await this.redisService.getJson<SessionData>(sessionKey);

    if (!sessionData) {
      throw new NotFoundException('Session not found');
    }

    // Update session data
    const updatedData: SessionData = {
      ...sessionData,
      ...updateDto,
      lastActivity: Date.now(),
      messageCount: updateDto.messageCount ?? sessionData.messageCount,
      context: updateDto.context ? { ...sessionData.context, ...updateDto.context } : sessionData.context,
    };

    try {
      // Update Redis
      const conversationKey = this.getConversationKey(sessionData.sessionId);
      await Promise.all([
        this.redisService.setJson(sessionKey, updatedData, this.sessionTimeout),
        this.redisService.setJson(conversationKey, updatedData, this.conversationTimeout),
      ]);

      // Update database
      await this.prismaService.session.update({
        where: { id: sessionData.sessionId },
        data: {
          sessionData: updatedData as any,
          lastActivity: new Date(updatedData.lastActivity),
        },
      });

      this.logger.log(`Updated session ${sessionData.sessionId} for ${normalizedPhone}`);

      return this.toResponseDto(updatedData);
    } catch (error) {
      this.logger.error(`Failed to update session for ${normalizedPhone}`, error);
      throw error;
    }
  }

  async extendSession(phoneNumber: string, additionalTime: number = 3600): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const sessionKey = this.getSessionKey(normalizedPhone);

    try {
      const sessionData = await this.redisService.getJson<SessionData>(sessionKey);

      if (!sessionData) {
        return false;
      }

      const newExpiresAt = sessionData.expiresAt + (additionalTime * 1000);
      const updatedData: SessionData = {
        ...sessionData,
        expiresAt: newExpiresAt,
        lastActivity: Date.now(),
      };

      // Update Redis TTL
      const conversationKey = this.getConversationKey(sessionData.sessionId);
      await Promise.all([
        this.redisService.setJson(sessionKey, updatedData, this.sessionTimeout + additionalTime),
        this.redisService.setJson(conversationKey, updatedData, this.conversationTimeout),
      ]);

      // Update database
      await this.prismaService.session.update({
        where: { id: sessionData.sessionId },
        data: {
          sessionData: updatedData as any,
          expiresAt: new Date(newExpiresAt),
          lastActivity: new Date(updatedData.lastActivity),
        },
      });

      this.logger.log(`Extended session ${sessionData.sessionId} for ${normalizedPhone}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to extend session for ${normalizedPhone}`, error);
      return false;
    }
  }

  async endSession(phoneNumber: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const sessionKey = this.getSessionKey(normalizedPhone);

    try {
      const sessionData = await this.redisService.getJson<SessionData>(sessionKey);

      if (sessionData) {
        const conversationKey = this.getConversationKey(sessionData.sessionId);
        
        // Remove from Redis
        await Promise.all([
          this.redisService.del(sessionKey),
          this.redisService.del(conversationKey),
        ]);

        // Remove from user sessions tracking
        await this.removeFromUserSessions(normalizedPhone, sessionData.sessionId);

        // Mark as expired in database (keep for analytics)
        await this.prismaService.session.update({
          where: { id: sessionData.sessionId },
          data: { expiresAt: new Date() },
        });

        this.logger.log(`Ended session ${sessionData.sessionId} for ${normalizedPhone}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to end session for ${normalizedPhone}`, error);
      return false;
    }
  }

  async endSessionById(sessionId: string): Promise<boolean> {
    try {
      const sessionData = await this.redisService.getJson<SessionData>(
        this.getConversationKey(sessionId)
      );

      if (sessionData) {
        return await this.endSession(sessionData.phoneNumber);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to end session ${sessionId}`, error);
      return false;
    }
  }

  async getActiveSessions(): Promise<number> {
    try {
      const pattern = 'session:*';
      const keys = await this.redisService.keys(pattern);
      return keys.length;
    } catch (error) {
      this.logger.error('Failed to get active sessions count', error);
      return 0;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const expiredSessions = await this.prismaService.session.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
        select: { phoneNumber: true, id: true },
      });

      let cleanedCount = 0;

      for (const session of expiredSessions) {
        await Promise.all([
          this.endSession(session.phoneNumber),
          this.prismaService.session.delete({ where: { id: session.id } }),
        ]);
        cleanedCount++;
      }

      this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions', error);
      return 0;
    }
  }

  private async restoreSessionFromDatabase(phoneNumber: string): Promise<SessionData | null> {
    try {
      const session = await this.prismaService.session.findFirst({
        where: {
          phoneNumber,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { lastActivity: 'desc' },
      });

      if (!session) {
        return null;
      }

      const sessionData = session.sessionData as any;

      // Restore to Redis
      const sessionKey = this.getSessionKey(phoneNumber);
      const conversationKey = this.getConversationKey(session.id);
      
      await Promise.all([
        this.redisService.setJson(sessionKey, sessionData, this.sessionTimeout),
        this.redisService.setJson(conversationKey, sessionData, this.conversationTimeout),
      ]);

      this.logger.log(`Restored session ${session.id} from database for ${phoneNumber}`);
      return sessionData;
    } catch (error) {
      this.logger.error(`Failed to restore session from database for ${phoneNumber}`, error);
      return null;
    }
  }

  private async checkConcurrentSessionLimit(): Promise<void> {
    const activeCount = await this.getActiveSessions();
    
    if (activeCount >= this.maxConcurrentSessions) {
      this.logger.warn(`Maximum concurrent sessions reached: ${activeCount}`);
      // Could implement session eviction strategy here
    }
  }

  private async addToUserSessions(phoneNumber: string, sessionId: string): Promise<void> {
    const key = this.getUserSessionsKey(phoneNumber);
    await this.redisService.lpush(key, sessionId);
    await this.redisService.expire(key, this.conversationTimeout);
  }

  private async removeFromUserSessions(phoneNumber: string, sessionId: string): Promise<void> {
    const key = this.getUserSessionsKey(phoneNumber);
    const sessions = await this.redisService.lrange(key, 0, -1);
    const filtered = sessions.filter(id => id !== sessionId);
    
    await this.redisService.del(key);
    if (filtered.length > 0) {
      await this.redisService.lpush(key, ...filtered);
      await this.redisService.expire(key, this.conversationTimeout);
    }
  }

  private toResponseDto(sessionData: SessionData): SessionResponseDto {
    return {
      sessionId: sessionData.sessionId,
      phoneNumber: sessionData.phoneNumber,
      currentFlow: sessionData.currentFlow,
      currentStep: sessionData.currentStep,
      context: sessionData.context,
      messageCount: sessionData.messageCount,
      createdAt: new Date(sessionData.createdAt),
      lastActivity: new Date(sessionData.lastActivity),
      expiresAt: new Date(sessionData.expiresAt),
      isActive: Date.now() < sessionData.expiresAt,
    };
  }
}