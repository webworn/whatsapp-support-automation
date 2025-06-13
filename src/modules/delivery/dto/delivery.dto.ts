import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  CONTACT = 'contact',
  QUICK_REPLY = 'quick_reply',
  BUTTON = 'button',
  LIST = 'list',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class QuickReplyDto {
  @ApiProperty({ description: 'Quick reply text' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Quick reply payload/value' })
  @IsString()
  payload: string;

  @ApiProperty({ description: 'Quick reply ID', required: false })
  @IsOptional()
  @IsString()
  id?: string;
}

export class ButtonDto {
  @ApiProperty({ description: 'Button text' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Button URL or payload' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Button type (url, postback)', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class MediaDto {
  @ApiProperty({ description: 'Media URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Media filename', required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ description: 'Media caption', required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ description: 'Media MIME type', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiProperty({ description: 'Message priority', enum: MessagePriority, required: false })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiProperty({ description: 'Quick reply options', type: [QuickReplyDto], required: false })
  @IsOptional()
  @IsArray()
  quickReplies?: QuickReplyDto[];

  @ApiProperty({ description: 'Button options', type: [ButtonDto], required: false })
  @IsOptional()
  @IsArray()
  buttons?: ButtonDto[];

  @ApiProperty({ description: 'Media attachment', required: false })
  @IsOptional()
  @IsObject()
  media?: MediaDto;

  @ApiProperty({ description: 'Schedule delivery time', required: false })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiProperty({ description: 'Message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkMessageDto {
  @ApiProperty({ description: 'List of recipient phone numbers' })
  @IsArray()
  @IsString({ each: true })
  phoneNumbers: string[];

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiProperty({ description: 'Message priority', enum: MessagePriority, required: false })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiProperty({ description: 'Batch size for processing', required: false })
  @IsOptional()
  @IsNumber()
  batchSize?: number;

  @ApiProperty({ description: 'Delay between batches in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  batchDelay?: number;
}

export class DeliveryResponseDto {
  @ApiProperty({ description: 'Whether message was sent successfully' })
  success: boolean;

  @ApiProperty({ description: 'MSG91 message ID' })
  messageId?: string;

  @ApiProperty({ description: 'Delivery status' })
  status: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Error details if failed', required: false })
  error?: string;

  @ApiProperty({ description: 'Estimated delivery time', required: false })
  estimatedDeliveryTime?: Date;

  @ApiProperty({ description: 'Cost estimate', required: false })
  cost?: number;
}

export class BulkDeliveryResponseDto {
  @ApiProperty({ description: 'Total messages in bulk request' })
  totalMessages: number;

  @ApiProperty({ description: 'Successfully queued messages' })
  successCount: number;

  @ApiProperty({ description: 'Failed messages' })
  failureCount: number;

  @ApiProperty({ description: 'Batch processing ID' })
  batchId: string;

  @ApiProperty({ description: 'Individual delivery responses', type: [DeliveryResponseDto] })
  results: DeliveryResponseDto[];

  @ApiProperty({ description: 'Estimated completion time' })
  estimatedCompletionTime: Date;

  @ApiProperty({ description: 'Total estimated cost' })
  totalCost: number;
}

export class DeliveryStatsDto {
  @ApiProperty({ description: 'Total messages sent' })
  totalSent: number;

  @ApiProperty({ description: 'Successfully delivered messages' })
  delivered: number;

  @ApiProperty({ description: 'Failed deliveries' })
  failed: number;

  @ApiProperty({ description: 'Pending deliveries' })
  pending: number;

  @ApiProperty({ description: 'Average delivery time in seconds' })
  averageDeliveryTime: number;

  @ApiProperty({ description: 'Delivery rate percentage' })
  deliveryRate: number;

  @ApiProperty({ description: 'Total cost' })
  totalCost: number;

  @ApiProperty({ description: 'Messages by type' })
  messagesByType: Record<string, number>;

  @ApiProperty({ description: 'Messages by status' })
  messagesByStatus: Record<string, number>;
}

export interface MSG91ApiResponse {
  message: string;
  type: string;
  requestId?: string;
  messageId?: string;
  error?: string;
}

export interface MSG91BulkResponse {
  message: string;
  type: string;
  requestId?: string;
  data?: Array<{
    messageId: string;
    phone: string;
    status: string;
  }>;
  error?: string;
}