import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  businessName: string;

  @IsString()
  @IsOptional()
  whatsappPhoneNumber?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    businessName: string;
    whatsappPhoneNumber?: string;
    aiModelPreference: string;
    subscriptionTier: string;
  };
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  whatsappPhoneNumber?: string;

  @IsString()
  @IsOptional()
  aiModelPreference?: string;
}