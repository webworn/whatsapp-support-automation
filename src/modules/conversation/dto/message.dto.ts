import { IsString, IsOptional, IsIn, IsInt, IsUUID, IsDateString } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsIn(['customer', 'ai', 'agent'])
  senderType: 'customer' | 'ai' | 'agent';

  @IsIn(['text', 'image', 'document', 'audio'])
  @IsOptional()
  messageType?: 'text' | 'image' | 'document' | 'audio' = 'text';

  @IsString()
  @IsOptional()
  whatsappMessageId?: string;

  @IsString()
  @IsOptional()
  aiModelUsed?: string;

  @IsInt()
  @IsOptional()
  processingTimeMs?: number;

  @IsString()
  @IsOptional()
  metadata?: string;
}

export class MessageQueryDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @IsOptional()
  senderType?: string;

  @IsString()
  @IsOptional()
  messageType?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search in message content

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsString()
  @IsOptional()
  limit?: string = '50';

  @IsString()
  @IsOptional()
  offset?: string = '0';

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  content: string;
  senderType: 'customer' | 'ai' | 'agent';
  messageType: string;
  whatsappMessageId?: string;
  aiModelUsed?: string;
  processingTimeMs?: number;
  timestamp: Date;
  createdAt: Date;
}