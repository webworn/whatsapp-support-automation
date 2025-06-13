import { BadRequestException } from '@nestjs/common';

export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) {
    throw new BadRequestException('Phone number is required');
  }

  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Remove leading zeros after country code
  normalized = normalized.replace(/^(\+\d{1,3})0+/, '$1');

  // Validate basic format
  if (!normalized.match(/^\+?\d{8,15}$/)) {
    throw new BadRequestException('Invalid phone number format');
  }

  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // Assume default country code if not provided
    const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '1';
    normalized = `+${defaultCountryCode}${normalized}`;
  }

  return normalized;
};

export const validatePhoneNumber = (phone: string): boolean => {
  try {
    normalizePhoneNumber(phone);
    return true;
  } catch {
    return false;
  }
};

export const extractCountryCode = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  const match = normalized.match(/^\+(\d{1,3})/);
  return match ? match[1] : '';
};

export const formatPhoneNumber = (phone: string, format: 'international' | 'national' = 'international'): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (format === 'national') {
    return normalized.substring(1); // Remove +
  }
  
  return normalized;
};