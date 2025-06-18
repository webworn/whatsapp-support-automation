import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 WhatsApp AI Railway Template is running! Go to /api/auth/* for authentication endpoints.';
  }
}