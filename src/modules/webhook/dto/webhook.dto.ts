import { IsString, IsOptional, IsObject, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookType {
  MESSAGE = 'message',
  DELIVERY = 'delivery',
  READ = 'read',
  STATUS = 'status',
}

export enum WebhookSource {
  MSG91 = 'msg91',
  MANUAL = 'manual',
  TEST = 'test',
}

export class WebhookPayloadDto {
  @ApiProperty({ description: 'Webhook type', enum: WebhookType })
  @IsEnum(WebhookType)
  type: WebhookType;

  @ApiProperty({ description: 'Webhook data' })
  @IsObject()
  data: any;

  @ApiProperty({ description: 'Timestamp of the event', required: false })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiProperty({ description: 'Event ID', required: false })
  @IsOptional()
  @IsString()
  eventId?: string;
}

export class MSG91MessageDto {
  @ApiProperty({ description: 'Sender phone number' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  to: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Message ID from MSG91' })
  @IsString()
  messageId: string;

  @ApiProperty({ description: 'Message type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Message timestamp' })
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'Additional message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MSG91DeliveryDto {
  @ApiProperty({ description: 'Message ID from MSG91' })
  @IsString()
  messageId: string;

  @ApiProperty({ description: 'Delivery status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Delivery timestamp' })
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'Error description if failed', required: false })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Additional delivery metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MSG91ReadDto {
  @ApiProperty({ description: 'Message ID from MSG91' })
  @IsString()
  messageId: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Read timestamp' })
  @IsString()
  timestamp: string;
}

export class WebhookResponseDto {
  @ApiProperty({ description: 'Whether webhook was processed successfully' })
  success: boolean;

  @ApiProperty({ description: 'Processing result message' })
  message: string;

  @ApiProperty({ description: 'Webhook ID for tracking' })
  webhookId?: string;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;

  @ApiProperty({ description: 'Error details if processing failed', required: false })
  error?: string;
}

export class WebhookStatsDto {
  @ApiProperty({ description: 'Total webhooks received' })
  totalReceived: number;

  @ApiProperty({ description: 'Successfully processed webhooks' })
  successfullyProcessed: number;

  @ApiProperty({ description: 'Failed webhook processing' })
  failed: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Webhooks by source' })
  bySource: Record<string, number>;

  @ApiProperty({ description: 'Webhooks by type' })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Recent processing errors' })
  recentErrors: Array<{
    timestamp: Date;
    error: string;
    source: string;
    type: string;
  }>;
}

export interface RawWebhookData {
  headers: Record<string, string>;
  body: any;
  query: Record<string, string>;
  ip: string;
  userAgent: string;
  receivedAt: Date;
}