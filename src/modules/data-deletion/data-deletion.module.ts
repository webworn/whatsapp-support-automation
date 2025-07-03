import { Module } from '@nestjs/common';
import { DataDeletionController } from './data-deletion.controller';
import { DataDeletionService } from './data-deletion.service';
import { PrismaService } from '../../shared/database/prisma.service';

@Module({
  controllers: [DataDeletionController],
  providers: [DataDeletionService, PrismaService],
  exports: [DataDeletionService],
})
export class DataDeletionModule {}