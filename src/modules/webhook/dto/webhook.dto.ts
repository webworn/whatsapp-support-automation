import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookType {
  MESSAGE = 'message',
  DELIVERY = 'delivery',
  READ = 'read',
  STATUS = 'status',
}

export enum WebhookSource {
  MSG91 = 'msg91',
  WHATSAPP_BUSINESS = 'whatsapp_business',
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

// WhatsApp Business API DTOs
export class WhatsAppBusinessWebhookDto {
  @ApiProperty({ description: 'WhatsApp Business object type' })
  @IsString()
  object: string;

  @ApiProperty({ description: 'Webhook entry data', type: [Object] })
  @IsObject()
  entry: WhatsAppBusinessEntryDto[];
}

export class WhatsAppBusinessEntryDto {
  @ApiProperty({ description: 'WhatsApp Business Account ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Webhook changes', type: [Object] })
  @IsObject()
  changes: WhatsAppBusinessChangeDto[];
}

export class WhatsAppBusinessChangeDto {
  @ApiProperty({ description: 'The value object' })
  @IsObject()
  value: WhatsAppBusinessValueDto;

  @ApiProperty({ description: 'The field that changed' })
  @IsString()
  field: string;
}

export class WhatsAppBusinessValueDto {
  @ApiProperty({ description: 'Messaging product', required: false })
  @IsOptional()
  @IsString()
  messaging_product?: string;

  @ApiProperty({ description: 'Metadata about the phone number', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    display_phone_number: string;
    phone_number_id: string;
  };

  @ApiProperty({ description: 'Array of contact objects', required: false })
  @IsOptional()
  @IsObject()
  contacts?: Array<{
    profile: {
      name: string;
    };
    wa_id: string;
  }>;

  @ApiProperty({ description: 'Array of message objects', required: false })
  @IsOptional()
  @IsObject()
  messages?: WhatsAppBusinessMessageDto[];

  @ApiProperty({ description: 'Array of status objects', required: false })
  @IsOptional()
  @IsObject()
  statuses?: Array<{
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
    conversation?: {
      id: string;
      expiration_timestamp?: string;
      origin: {
        type: string;
      };
    };
    pricing?: {
      billable: boolean;
      pricing_model: string;
      category: string;
    };
  }>;
}

export class WhatsAppBusinessMessageDto {
  @ApiProperty({ description: 'Message ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Sender WhatsApp ID' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'Message timestamp' })
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'Message type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Text message content', required: false })
  @IsOptional()
  @IsObject()
  text?: {
    body: string;
  };

  @ApiProperty({ description: 'Image message content', required: false })
  @IsOptional()
  @IsObject()
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };

  @ApiProperty({ description: 'Document message content', required: false })
  @IsOptional()
  @IsObject()
  document?: {
    caption?: string;
    filename?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };

  @ApiProperty({ description: 'Audio message content', required: false })
  @IsOptional()
  @IsObject()
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    voice?: boolean;
  };

  @ApiProperty({ description: 'Video message content', required: false })
  @IsOptional()
  @IsObject()
  video?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };

  @ApiProperty({ description: 'Interactive message content', required: false })
  @IsOptional()
  @IsObject()
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };

  @ApiProperty({ description: 'Context information', required: false })
  @IsOptional()
  @IsObject()
  context?: {
    from: string;
    id: string;
  };
}