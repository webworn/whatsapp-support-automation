import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      name: 'WhatsApp Support Automation',
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      timestamp: new Date().toISOString(),
      status: 'operational',
    };
  }
}