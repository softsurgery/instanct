import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDeviceDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty({ type: Boolean, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isTrusted?: boolean;
}
