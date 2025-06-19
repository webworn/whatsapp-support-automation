import { Module } from '@nestjs/common';
import { DashboardGateway } from './dashboard.gateway';
import { ConversationModule } from '../modules/conversation/conversation.module';

@Module({
  imports: [ConversationModule],
  providers: [DashboardGateway],
  exports: [DashboardGateway],
})
export class DashboardModule {}