import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import databaseConfig from '../../config/database.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}