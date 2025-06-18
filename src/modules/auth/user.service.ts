import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto): Promise<User> {
    const { email, password, businessName, whatsappPhoneNumber } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        businessName,
        whatsappPhoneNumber,
        isEmailVerified: true, // Auto-verify for simplicity
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
    });
  }

  async getUserStats(userId: string) {
    const [totalConversations, activeConversations, totalMessages, documentsCount] = await Promise.all([
      this.prisma.conversation.count({
        where: { userId },
      }),
      this.prisma.conversation.count({
        where: { userId, status: 'active' },
      }),
      this.prisma.message.count({
        where: { conversation: { userId } },
      }),
      this.prisma.document.count({
        where: { userId },
      }),
    ]);

    return {
      totalConversations,
      activeConversations,
      totalMessages,
      documentsCount,
    };
  }

  // Get user without password hash for API responses
  sanitizeUser(user: User) {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}