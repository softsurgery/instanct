import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserConnectionHistoryDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({ type: String, required: false, default: 'mobile' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  socketId?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  location?: string;
}
