import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { OpenRouterService } from './openrouter.service';
import llmConfig from '../../config/llm.config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    ConfigModule.forFeature(llmConfig),
  ],
  providers: [LlmService, OpenRouterService],
  exports: [LlmService],
})
export class LlmModule {}