import * as crypto from 'crypto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string,
): boolean => {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex'),
    );
  } catch (error) {
    return false;
  }
};

export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
  const missingFields = requiredFields.filter(field => {
    const value = getNestedValue(data, field);
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
};

export const validateMessageContent = (content: string): void => {
  if (!content || content.trim().length === 0) {
    throw new BadRequestException('Message content cannot be empty');
  }

  if (content.length > 4096) {
    throw new BadRequestException('Message content too long (max 4096 characters)');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      throw new BadRequestException('Message content contains invalid characters');
    }
  }
};

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashString = (input: string, algorithm: string = 'sha256'): string => {
  return crypto.createHash(algorithm).update(input).digest('hex');
};