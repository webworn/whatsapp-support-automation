import { IsString, IsOptional, IsObject, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LlmRequestDto {
  @ApiProperty({ description: 'User message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Session context data', required: false })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiProperty({ description: 'Specific model to use', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Maximum tokens for response', required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({ description: 'Temperature for response generation', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ description: 'User phone number for tracking', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class LlmResponseDto {
  @ApiProperty({ description: 'Generated response text' })
  response: string;

  @ApiProperty({ description: 'Model used for generation' })
  modelUsed: string;

  @ApiProperty({ description: 'Cost of the request in USD' })
  cost: number;

  @ApiProperty({ description: 'Total tokens used' })
  tokensUsed: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;

  @ApiProperty({ description: 'Whether request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Error message if request failed', required: false })
  error?: string;
}

export class ChatMessage {
  @ApiProperty({ description: 'Message role' })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;
}

export class BatchLlmRequestDto {
  @ApiProperty({ description: 'Array of messages to process', type: [LlmRequestDto] })
  @IsArray()
  requests: LlmRequestDto[];

  @ApiProperty({ description: 'Whether to process requests in parallel', required: false })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean;
}

export class BatchLlmResponseDto {
  @ApiProperty({ description: 'Array of responses', type: [LlmResponseDto] })
  responses: LlmResponseDto[];

  @ApiProperty({ description: 'Total cost for all requests' })
  totalCost: number;

  @ApiProperty({ description: 'Total processing time in milliseconds' })
  totalProcessingTime: number;

  @ApiProperty({ description: 'Number of successful requests' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed requests' })
  failureCount: number;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}