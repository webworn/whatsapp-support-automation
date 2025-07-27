import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { MessagingModule } from '../messaging/messaging.module';
import whatsappConfig from '../../config/whatsapp.config';

@Module({
  imports: [
    ConfigModule.forFeature(whatsappConfig),
    MessagingModule,
  ],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}