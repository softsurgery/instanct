import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class RequestSignInDto {
  @ApiProperty({
    type: String,
    example: faker.internet.email(),
  })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  @Length(8, 128)
  password: string;

  @ApiPropertyOptional({ type: String, example: 'iPhone 15 Pro' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({ type: String, example: 'iOS 18.5' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ type: Number, example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ type: Number, example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ type: String, example: 'Paris, France' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ type: String, example: 'a1b2c3d4e5f6...' })
  @IsOptional()
  @IsString()
  fingerprint?: string;
}
