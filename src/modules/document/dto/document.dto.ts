import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FileType {
  PDF = 'pdf',
  TXT = 'txt',
  DOC = 'doc',
  DOCX = 'docx'
}

export enum DocumentStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error'
}

export class CreateDocumentDto {
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  content?: string; // For text content uploads
}

export class DocumentResponseDto {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  status: string;
  category?: string;
  tags?: string;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}