import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  Headers,
  UnauthorizedException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/documents')
@Public()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  private validateAuth(userId: string, password: string): void {
    const validUserId = process.env.SIMPLE_USER_ID || 'admin';
    const validPassword = process.env.SIMPLE_PASSWORD || 'admin123';
    
    if (userId !== validUserId || password !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<DocumentResponseDto> {
    this.validateAuth(userId, password);
    // Use a default user ID for document ownership
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    return this.documentService.uploadDocument(defaultUserId, file, createDocumentDto);
  }

  @Post('upload-text')
  async uploadTextDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<DocumentResponseDto> {
    this.validateAuth(userId, password);
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    return this.documentService.uploadDocument(defaultUserId, null, createDocumentDto);
  }

  @Get()
  async getDocuments(
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<DocumentResponseDto[]> {
    this.validateAuth(userId, password);
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    return this.documentService.getUserDocuments(defaultUserId);
  }

  @Get(':id')
  async getDocument(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<DocumentResponseDto> {
    this.validateAuth(userId, password);
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    return this.documentService.getDocument(defaultUserId, id);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<{ success: boolean }> {
    this.validateAuth(userId, password);
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    await this.documentService.deleteDocument(defaultUserId, id);
    return { success: true };
  }

  @Get(':id/content')
  async getDocumentContent(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-password') password: string
  ): Promise<{ content: string }> {
    this.validateAuth(userId, password);
    const defaultUserId = '20a541cd-8ab3-4018-823e-11ed5e9837a1';
    const content = await this.documentService.getDocumentContent(defaultUserId, id);
    return { content };
  }
}