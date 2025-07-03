import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import * as crypto from 'crypto';

interface FacebookUserData {
  user_id: string;
  algorithm: string;
  issued_at: number;
}

interface DeletionRequest {
  id: string;
  email?: string;
  phone?: string;
  reason?: string;
  facebookUserId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confirmationCode: string;
  requestedAt: Date;
  processedAt?: Date;
}

@Injectable()
export class DataDeletionService {
  private readonly logger = new Logger(DataDeletionService.name);

  constructor(private prisma: PrismaService) {}

  async parseSignedRequest(signedRequest: string): Promise<FacebookUserData> {
    try {
      const [signature, payload] = signedRequest.split('.');
      
      if (!signature || !payload) {
        throw new BadRequestException('Invalid signed request format');
      }

      // Decode the payload (base64url)
      const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');
      const userData = JSON.parse(decodedPayload);

      // Verify the signature if app secret is available
      if (process.env.FACEBOOK_APP_SECRET) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
          .update(payload)
          .digest('base64url');
        
        if (signature !== expectedSignature) {
          throw new BadRequestException('Invalid signature');
        }
      }

      return userData;
    } catch (error) {
      this.logger.error('Error parsing signed request:', error);
      throw new BadRequestException('Failed to parse signed request');
    }
  }

  async processFacebookDeletion(userData: FacebookUserData): Promise<string> {
    const confirmationCode = this.generateConfirmationCode();
    
    try {
      // Log the deletion request (in a real implementation, you might save this to a database)
      this.logger.log(`Processing Facebook deletion for user: ${userData.user_id}`);
      
      // Create deletion request record
      const deletionRequest: DeletionRequest = {
        id: crypto.randomUUID(),
        facebookUserId: userData.user_id,
        status: 'pending',
        confirmationCode,
        requestedAt: new Date(),
      };

      // In a real implementation, save to database
      await this.saveDeletionRequest(deletionRequest);
      
      // Schedule the actual deletion (this would typically be done via a job queue)
      this.scheduleDeletion(deletionRequest);
      
      return confirmationCode;
    } catch (error) {
      this.logger.error('Error processing Facebook deletion:', error);
      throw error;
    }
  }

  async processManualDeletion(request: { email?: string; phone?: string; reason?: string }): Promise<string> {
    const confirmationCode = this.generateConfirmationCode();
    
    try {
      this.logger.log(`Processing manual deletion for: ${request.email || request.phone}`);
      
      // Create deletion request record
      const deletionRequest: DeletionRequest = {
        id: crypto.randomUUID(),
        email: request.email,
        phone: request.phone,
        reason: request.reason,
        status: 'pending',
        confirmationCode,
        requestedAt: new Date(),
      };

      await this.saveDeletionRequest(deletionRequest);
      this.scheduleDeletion(deletionRequest);
      
      return confirmationCode;
    } catch (error) {
      this.logger.error('Error processing manual deletion:', error);
      throw error;
    }
  }

  private async saveDeletionRequest(request: DeletionRequest): Promise<void> {
    try {
      // In a real implementation, you might create a dedicated table for deletion requests
      // For now, we'll log the request
      this.logger.log(`Saving deletion request: ${JSON.stringify({
        id: request.id,
        email: request.email,
        phone: request.phone,
        status: request.status,
        confirmationCode: request.confirmationCode,
        requestedAt: request.requestedAt,
      })}`);
      
      // TODO: Implement database storage for deletion requests
      // await this.prisma.dataDeletionRequest.create({ data: request });
    } catch (error) {
      this.logger.error('Error saving deletion request:', error);
      throw error;
    }
  }

  private scheduleDeletion(request: DeletionRequest): void {
    // In a real implementation, this would use a job queue (Bull, etc.)
    setTimeout(async () => {
      try {
        await this.performDeletion(request);
      } catch (error) {
        this.logger.error(`Failed to delete data for request ${request.id}:`, error);
      }
    }, 1000); // Immediate for demo, in real implementation this might be delayed
  }

  private async performDeletion(request: DeletionRequest): Promise<void> {
    try {
      this.logger.log(`Starting data deletion for request: ${request.id}`);

      // Delete user data based on email or phone
      if (request.email) {
        await this.deleteUserDataByEmail(request.email);
      }
      
      if (request.phone) {
        await this.deleteUserDataByPhone(request.phone);
      }

      // Update deletion request status
      request.status = 'completed';
      request.processedAt = new Date();
      
      this.logger.log(`Data deletion completed for request: ${request.id}`);
    } catch (error) {
      this.logger.error(`Error during data deletion for request ${request.id}:`, error);
      request.status = 'failed';
      throw error;
    }
  }

  private async deleteUserDataByEmail(email: string): Promise<void> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          conversations: {
            include: {
              messages: true,
            },
          },
          userSessions: true,
        },
      });

      if (user) {
        // Delete all messages in user conversations
        for (const conversation of user.conversations) {
          await this.prisma.message.deleteMany({
            where: { conversationId: conversation.id },
          });
        }

        // Delete all conversations
        await this.prisma.conversation.deleteMany({
          where: { userId: user.id },
        });

        // Delete user sessions
        await this.prisma.userSession.deleteMany({
          where: { userId: user.id },
        });

        // Delete the user
        await this.prisma.user.delete({
          where: { id: user.id },
        });

        this.logger.log(`Successfully deleted all data for user email: ${email}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting data for email ${email}:`, error);
      throw error;
    }
  }

  private async deleteUserDataByPhone(phone: string): Promise<void> {
    try {
      // Delete conversations by customer phone
      const conversations = await this.prisma.conversation.findMany({
        where: { customerPhone: phone },
        include: { messages: true },
      });

      for (const conversation of conversations) {
        // Delete all messages in conversation
        await this.prisma.message.deleteMany({
          where: { conversationId: conversation.id },
        });

        // Delete the conversation
        await this.prisma.conversation.delete({
          where: { id: conversation.id },
        });
      }

      this.logger.log(`Successfully deleted all data for phone: ${phone}`);
    } catch (error) {
      this.logger.error(`Error deleting data for phone ${phone}:`, error);
      throw error;
    }
  }

  private generateConfirmationCode(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async getDeletionStatus(confirmationCode: string): Promise<any> {
    // In a real implementation, this would query the database
    this.logger.log(`Checking deletion status for code: ${confirmationCode}`);
    
    return {
      confirmation_code: confirmationCode,
      status: 'pending',
      message: 'Your data deletion request is being processed and will be completed within 30 days.',
      requested_at: new Date().toISOString(),
    };
  }
}