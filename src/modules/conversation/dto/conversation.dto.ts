import { IsString, IsBoolean, IsOptional, IsPhoneNumber, IsUUID, IsIn, IsDateString } from 'class-validator';

export class CreateConversationDto {
  @IsPhoneNumber()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean = true;
}

export class UpdateConversationDto {
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsIn(['active', 'closed', 'archived'])
  @IsOptional()
  status?: 'active' | 'closed' | 'archived';

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @IsString()
  @IsOptional()
  metadata?: string;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsIn(['text', 'image', 'document', 'audio'])
  @IsOptional()
  messageType?: 'text' | 'image' | 'document' | 'audio' = 'text';
}

export class ConversationQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search in customer name or phone

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @IsString()
  @IsOptional()
  sortBy?: 'lastMessageAt' | 'createdAt' = 'lastMessageAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsString()
  @IsOptional()
  limit?: string = '20';

  @IsString()
  @IsOptional()
  offset?: string = '0';
}

export class ConversationResponseDto {
  id: string;
  customerPhone: string;
  customerName?: string;
  status: string;
  aiEnabled: boolean;
  lastMessageAt: Date;
  messageCount: number;
  lastMessage?: {
    content: string;
    senderType: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}