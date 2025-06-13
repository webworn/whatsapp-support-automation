import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ESCALATED = 'escalated',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export class CreateUserDto {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'User name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User preferred language', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Additional user metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateConversationDto {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Conversation language', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Initial conversation metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsNumber()
  conversationId: number;

  @ApiProperty({ description: 'Message direction', enum: MessageDirection })
  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiProperty({ description: 'Sender phone number', required: false })
  @IsOptional()
  @IsString()
  senderNumber?: string;

  @ApiProperty({ description: 'Recipient phone number', required: false })
  @IsOptional()
  @IsString()
  recipientNumber?: string;

  @ApiProperty({ description: 'MSG91 message ID', required: false })
  @IsOptional()
  @IsString()
  msg91MessageId?: string;

  @ApiProperty({ description: 'Whether message is from LLM', required: false })
  @IsOptional()
  @IsBoolean()
  isFromLlm?: boolean;

  @ApiProperty({ description: 'LLM model used', required: false })
  @IsOptional()
  @IsString()
  llmModelUsed?: string;

  @ApiProperty({ description: 'LLM cost', required: false })
  @IsOptional()
  @IsNumber()
  llmCost?: number;

  @ApiProperty({ description: 'Processing time in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  processingTime?: number;

  @ApiProperty({ description: 'Additional message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateConversationDto {
  @ApiProperty({ description: 'Conversation status', enum: ConversationStatus, required: false })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @ApiProperty({ description: 'Current flow', required: false })
  @IsOptional()
  @IsString()
  currentFlow?: string;

  @ApiProperty({ description: 'Current step', required: false })
  @IsOptional()
  @IsString()
  currentStep?: string;

  @ApiProperty({ description: 'Escalation reason', required: false })
  @IsOptional()
  @IsString()
  escalationReason?: string;

  @ApiProperty({ description: 'Resolution time in seconds', required: false })
  @IsOptional()
  @IsNumber()
  resolutionTime?: number;

  @ApiProperty({ description: 'Satisfaction score', required: false })
  @IsOptional()
  @IsNumber()
  satisfactionScore?: number;

  @ApiProperty({ description: 'Additional conversation metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessMessageDto {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiProperty({ description: 'MSG91 message ID', required: false })
  @IsOptional()
  @IsString()
  msg91MessageId?: string;

  @ApiProperty({ description: 'Message timestamp', required: false })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiProperty({ description: 'Additional message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ConversationResponseDto {
  @ApiProperty({ description: 'Conversation ID' })
  id: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    phoneNumber: string;
    name?: string;
    language: string;
  };

  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Conversation status' })
  status: ConversationStatus;

  @ApiProperty({ description: 'Current flow' })
  currentFlow?: string;

  @ApiProperty({ description: 'Current step' })
  currentStep?: string;

  @ApiProperty({ description: 'Conversation language' })
  language: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Completed timestamp' })
  completedAt?: Date;

  @ApiProperty({ description: 'Message count' })
  messageCount: number;

  @ApiProperty({ description: 'Recent messages' })
  recentMessages?: MessageResponseDto[];
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Message ID' })
  id: number;

  @ApiProperty({ description: 'Message direction' })
  direction: MessageDirection;

  @ApiProperty({ description: 'Message type' })
  messageType: MessageType;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Delivery status' })
  deliveryStatus: DeliveryStatus;

  @ApiProperty({ description: 'Whether message is from LLM' })
  isFromLlm: boolean;

  @ApiProperty({ description: 'LLM model used' })
  llmModelUsed?: string;

  @ApiProperty({ description: 'LLM cost' })
  llmCost: number;

  @ApiProperty({ description: 'Processing time' })
  processingTime?: number;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Delivered timestamp' })
  deliveredAt?: Date;
}

export class ConversationStatsDto {
  @ApiProperty({ description: 'Total conversations' })
  totalConversations: number;

  @ApiProperty({ description: 'Active conversations' })
  activeConversations: number;

  @ApiProperty({ description: 'Completed conversations' })
  completedConversations: number;

  @ApiProperty({ description: 'Escalated conversations' })
  escalatedConversations: number;

  @ApiProperty({ description: 'Average resolution time in seconds' })
  averageResolutionTime: number;

  @ApiProperty({ description: 'Average satisfaction score' })
  averageSatisfactionScore: number;

  @ApiProperty({ description: 'Total messages' })
  totalMessages: number;

  @ApiProperty({ description: 'Messages from LLM' })
  llmMessages: number;

  @ApiProperty({ description: 'Total LLM cost' })
  totalLlmCost: number;
}