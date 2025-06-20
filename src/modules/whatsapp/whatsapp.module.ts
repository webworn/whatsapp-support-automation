import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import whatsappConfig from '../../config/whatsapp.config';

@Module({
  imports: [
    ConfigModule.forFeature(whatsappConfig),
  ],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}