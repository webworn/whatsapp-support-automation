import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Ensure database connection
      await this.prisma.ensureConnected();
      
      // Create user
      const user = await this.userService.createUser(registerDto);

      // Create initial session
      const { accessToken, sessionId } = await this.generateTokens(user);

      // Log registration
      this.logger.log(`New user registered: ${user.email}`);

      return {
        accessToken,
        user: this.userService.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    try {
      const { email, password } = loginDto;

      // Ensure database connection
      await this.prisma.ensureConnected();

      // Find user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isPasswordValid = await this.userService.validatePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens and create session
      const { accessToken, sessionId } = await this.generateTokens(user, ipAddress, userAgent);

      // Update last login
      await this.userService.updateLastLogin(user.id);

      this.logger.log(`User logged in: ${user.email}`);

      return {
        accessToken,
        user: this.userService.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.userSession.delete({
      where: { id: sessionId },
    });

    this.logger.log(`User session ended: ${sessionId}`);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.validatePassword(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async validateSession(tokenPayload: any): Promise<User | null> {
    const { sub: userId, sessionId } = tokenPayload;

    // Check if session exists and is valid
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.userId !== userId) {
      return null;
    }

    return session.user;
  }

  private async generateTokens(user: User, ipAddress?: string, userAgent?: string) {
    // Create session
    const sessionId = crypto.randomUUID();
    const tokenHash = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, sessionId };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async cleanExpiredSessions(): Promise<void> {
    const deletedSessions = await this.prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned ${deletedSessions.count} expired sessions`);
  }
}