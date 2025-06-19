import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  UseGuards,
  Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDocumentDto, DocumentResponseDto } from './dto/document.dto';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Request() req: any
  ): Promise<DocumentResponseDto> {
    const userId = req.user.sub;
    return this.documentService.uploadDocument(userId, file, createDocumentDto);
  }

  @Get()
  async getDocuments(@Request() req: any): Promise<DocumentResponseDto[]> {
    const userId = req.user.sub;
    return this.documentService.getUserDocuments(userId);
  }

  @Get(':id')
  async getDocument(@Param('id') id: string, @Request() req: any): Promise<DocumentResponseDto> {
    const userId = req.user.sub;
    return this.documentService.getDocument(userId, id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string, @Request() req: any): Promise<{ success: boolean }> {
    const userId = req.user.sub;
    await this.documentService.deleteDocument(userId, id);
    return { success: true };
  }

  @Get(':id/content')
  async getDocumentContent(@Param('id') id: string, @Request() req: any): Promise<{ content: string }> {
    const userId = req.user.sub;
    const content = await this.documentService.getDocumentContent(userId, id);
    return { content };
  }
}