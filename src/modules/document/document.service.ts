import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateDocumentDto, DocumentResponseDto, FileType, DocumentStatus } from './dto/document.dto';
import * as path from 'path';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['pdf', 'txt', 'doc', 'docx'];

  constructor(private readonly prisma: PrismaService) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto
  ): Promise<DocumentResponseDto> {
    try {
      // Validate file
      if (file && file.size > this.MAX_FILE_SIZE) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      const fileExtension = file 
        ? path.extname(file.originalname).toLowerCase().substring(1)
        : 'txt';

      if (!this.ALLOWED_TYPES.includes(fileExtension)) {
        throw new BadRequestException(`File type .${fileExtension} not supported`);
      }

      // Extract content
      let content = createDocumentDto.content || '';
      if (file) {
        content = await this.extractTextContent(file, fileExtension);
      }

      // Check user document limit (50 per user)
      const documentCount = await this.prisma.document.count({
        where: { userId }
      });

      if (documentCount >= 50) {
        throw new BadRequestException('Document limit reached (50 documents per user)');
      }

      // Create document record
      const document = await this.prisma.document.create({
        data: {
          userId,
          filename: createDocumentDto.filename,
          originalName: file?.originalname || createDocumentDto.filename,
          fileType: fileExtension,
          fileSize: file?.size || content.length,
          content,
          status: DocumentStatus.READY,
          category: createDocumentDto.category,
          tags: createDocumentDto.tags,
        },
      });

      this.logger.log(`Document uploaded: ${document.filename} for user ${userId}`);
      return this.mapToResponseDto(document);

    } catch (error) {
      this.logger.error(`Failed to upload document for user ${userId}`, error);
      throw error;
    }
  }

  async getUserDocuments(userId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async getDocument(userId: string, documentId: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.mapToResponseDto(document);
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.delete({
      where: { id: documentId },
    });

    this.logger.log(`Document deleted: ${document.filename} for user ${userId}`);
  }

  async getDocumentContent(userId: string, documentId: string): Promise<string> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
      select: { content: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document.content;
  }

  async searchDocuments(userId: string, query: string): Promise<DocumentResponseDto[]> {
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        OR: [
          { filename: { contains: query } },
          { content: { contains: query } },
          { category: { contains: query } },
          { tags: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async getRelevantDocuments(userId: string, query: string, limit: number = 5): Promise<string[]> {
    // Simple keyword-based search for AI context
    // In production, this would use vector embeddings
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        status: DocumentStatus.READY,
        content: { contains: query },
      },
      select: { content: true },
      take: limit,
    });

    return documents.map(doc => doc.content);
  }

  private async extractTextContent(file: Express.Multer.File, fileType: string): Promise<string> {
    try {
      switch (fileType) {
        case 'txt':
          return file.buffer.toString('utf-8');
        
        case 'pdf':
          // In production, use pdf-parse or similar
          return '[PDF content extraction not implemented - use text upload for now]';
        
        case 'doc':
        case 'docx':
          // In production, use mammoth or similar
          return '[DOC content extraction not implemented - use text upload for now]';
        
        default:
          throw new BadRequestException(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to extract content from ${fileType} file`, error);
      throw new BadRequestException(`Failed to process ${fileType} file`);
    }
  }

  private mapToResponseDto(document: any): DocumentResponseDto {
    return {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      status: document.status,
      category: document.category,
      tags: document.tags,
      uploadDate: document.createdAt, // Alias for compatibility
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}