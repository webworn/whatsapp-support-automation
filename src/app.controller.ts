import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'WhatsApp AI Railway Template',
      version: '3.0.0',
    };
  }
}