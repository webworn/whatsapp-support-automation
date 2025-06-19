import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: User
  ): Promise<DocumentResponseDto> {
    return this.documentService.uploadDocument(user.id, file, createDocumentDto);
  }

  @Post('upload-text')
  async uploadTextDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: User
  ): Promise<DocumentResponseDto> {
    return this.documentService.uploadDocument(user.id, null, createDocumentDto);
  }

  @Get()
  async getDocuments(@CurrentUser() user: User): Promise<DocumentResponseDto[]> {
    return this.documentService.getUserDocuments(user.id);
  }

  @Get(':id')
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<DocumentResponseDto> {
    return this.documentService.getDocument(user.id, id);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<{ success: boolean }> {
    await this.documentService.deleteDocument(user.id, id);
    return { success: true };
  }

  @Get(':id/content')
  async getDocumentContent(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<{ content: string }> {
    const content = await this.documentService.getDocumentContent(user.id, id);
    return { content };
  }
}