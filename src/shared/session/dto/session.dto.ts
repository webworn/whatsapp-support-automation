import { IsString, IsOptional, IsObject, IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Initial session context', required: false })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class UpdateSessionDto {
  @ApiProperty({ description: 'Current conversation flow', required: false })
  @IsOptional()
  @IsString()
  currentFlow?: string;

  @ApiProperty({ description: 'Current step in flow', required: false })
  @IsOptional()
  @IsString()
  currentStep?: string;

  @ApiProperty({ description: 'Session context data', required: false })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiProperty({ description: 'Message count in session', required: false })
  @IsOptional()
  @IsNumber()
  messageCount?: number;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'User phone number' })
  phoneNumber: string;

  @ApiProperty({ description: 'Current conversation flow' })
  currentFlow?: string;

  @ApiProperty({ description: 'Current step in flow' })
  currentStep?: string;

  @ApiProperty({ description: 'Session context data' })
  context: Record<string, any>;

  @ApiProperty({ description: 'Message count in session' })
  messageCount: number;

  @ApiProperty({ description: 'Session created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last activity timestamp' })
  lastActivity: Date;

  @ApiProperty({ description: 'Session expiration timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether session is active' })
  isActive: boolean;
}

export interface SessionData {
  sessionId: string;
  phoneNumber: string;
  currentFlow?: string;
  currentStep?: string;
  context: Record<string, any>;
  messageCount: number;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}