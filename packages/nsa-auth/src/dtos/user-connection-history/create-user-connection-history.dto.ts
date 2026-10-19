import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserConnectionHistoryDto {
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
}
