import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DeliveryService } from './delivery.service';
import { MSG91Service } from './msg91.service';
import { QueueModule } from '../../shared/queue/queue.module';
import whatsappConfig from '../../config/whatsapp.config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    ConfigModule.forFeature(whatsappConfig),
    QueueModule,
  ],
  providers: [DeliveryService, MSG91Service],
  exports: [DeliveryService],
})
export class DeliveryModule {}