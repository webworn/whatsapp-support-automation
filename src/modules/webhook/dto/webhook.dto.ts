import { IsString, IsObject, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class WhatsAppMessageDto {
  @IsString()
  from: string;

  @IsString()
  id: string;

  @IsString()
  timestamp: string;

  @IsString()
  type: string;

  @IsObject()
  @IsOptional()
  text?: {
    body: string;
  };

  @IsObject()
  @IsOptional()
  image?: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };

  @IsObject()
  @IsOptional()
  document?: {
    mime_type: string;
    sha256: string;
    id: string;
    filename?: string;
    caption?: string;
  };

  @IsObject()
  @IsOptional()
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
  };

  @IsObject()
  @IsOptional()
  button?: {
    payload: string;
    text: string;
  };

  @IsObject()
  @IsOptional()
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
}

export class WhatsAppStatusDto {
  @IsString()
  id: string;

  @IsString()
  status: string;

  @IsString()
  timestamp: string;

  @IsString()
  recipient_id: string;
}

export class WhatsAppWebhookDto {
  @IsString()
  object: string;

  @IsArray()
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: WhatsAppMessageDto[];
        statuses?: WhatsAppStatusDto[];
      };
      field: string;
    }>;
  }>;
}

export class WebhookVerificationDto {
  @IsString()
  'hub.mode': string;

  @IsString()
  'hub.challenge': string;

  @IsString()
  'hub.verify_token': string;
}

export class ProcessedMessageDto {
  id: string;
  conversationId: string;
  from: string;
  content: string;
  messageType: string;
  timestamp: Date;
  whatsappMessageId: string;
  customerName?: string;
}