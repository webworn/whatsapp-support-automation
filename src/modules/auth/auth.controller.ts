import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Put,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    // Extract session ID from JWT payload
    const sessionId = req.user.sessionId;
    await this.authService.logout(sessionId);
    return { message: 'Successfully logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    const userStats = await this.userService.getUserStats(user.id);
    return {
      user: this.userService.sanitizeUser(user),
      stats: userStats,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.userService.updateProfile(user.id, updateDto);
    return {
      user: this.userService.sanitizeUser(updatedUser),
    };
  }

  @Get('health')
  @Public()
  async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('debug')
  @Public()
  async debugAuth() {
    try {
      // Test that all services are loaded
      const testUser = {
        email: 'test@debug.com',
        id: 'debug-id'
      };
      
      return {
        status: 'ok',
        message: 'Auth module loaded successfully',
        services: {
          authService: !!this.authService,
          userService: !!this.userService,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Auth module error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}