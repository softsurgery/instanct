import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OAuthProvider } from '../../enums/oauth.enum';

export class RequestClientOAuthDto {
  @ApiProperty({
    enum: OAuthProvider,
    description: 'OAuth provider (e.g., google, linkedin, apple)',
    example: 'google',
  })
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

  @ApiProperty({
    description: 'ID token or access token from the OAuth provider',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description:
      'The redirect URI used in the frontend (required for some providers like Google authorization code exchange)',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiProperty({
    description:
      'The code verifier used in the frontend (required for some providers like Google authorization code exchange)',
    required: false,
  })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  fingerprint?: string;
}
