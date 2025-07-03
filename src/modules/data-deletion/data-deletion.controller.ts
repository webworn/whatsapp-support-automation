import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DataDeletionService } from './data-deletion.service';
import { Public } from '../auth/decorators/public.decorator';

interface FacebookDeletionRequest {
  signed_request: string;
}

interface DeletionResponse {
  url: string;
  confirmation_code: string;
}

@Controller('api/data-deletion')
@Public()
export class DataDeletionController {
  private readonly logger = new Logger(DataDeletionController.name);

  constructor(private readonly dataDeletionService: DataDeletionService) {}

  @Post('facebook-callback')
  @HttpCode(HttpStatus.OK)
  async handleFacebookDeletionCallback(
    @Body() body: FacebookDeletionRequest,
  ): Promise<DeletionResponse> {
    try {
      this.logger.log('Received Facebook data deletion callback');
      
      if (!body.signed_request) {
        throw new BadRequestException('Missing signed_request parameter');
      }

      // Parse the signed request from Facebook
      const userData = await this.dataDeletionService.parseSignedRequest(body.signed_request);
      
      // Process the deletion request
      const confirmationCode = await this.dataDeletionService.processFacebookDeletion(userData);
      
      // Return the response URL and confirmation code as required by Facebook
      return {
        url: `${process.env.BASE_URL || 'https://whatsapp-support-automation-production.up.railway.app'}/data-deletion-status?code=${confirmationCode}`,
        confirmation_code: confirmationCode,
      };
    } catch (error) {
      this.logger.error('Error processing Facebook deletion callback:', error);
      throw error;
    }
  }

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestDataDeletion(
    @Body() body: { email?: string; phone?: string; reason?: string },
  ) {
    try {
      this.logger.log('Received manual data deletion request');
      
      if (!body.email && !body.phone) {
        throw new BadRequestException('Either email or phone number is required');
      }

      const confirmationCode = await this.dataDeletionService.processManualDeletion(body);
      
      return {
        success: true,
        message: 'Data deletion request received and will be processed within 30 days',
        confirmation_code: confirmationCode,
        status_url: `${process.env.BASE_URL || 'https://whatsapp-support-automation-production.up.railway.app'}/data-deletion-status?code=${confirmationCode}`,
      };
    } catch (error) {
      this.logger.error('Error processing manual deletion request:', error);
      throw error;
    }
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getDeletionStatus(@Query('code') confirmationCode: string) {
    try {
      if (!confirmationCode) {
        throw new BadRequestException('Confirmation code is required');
      }

      const status = await this.dataDeletionService.getDeletionStatus(confirmationCode);
      return status;
    } catch (error) {
      this.logger.error('Error getting deletion status:', error);
      throw error;
    }
  }
}