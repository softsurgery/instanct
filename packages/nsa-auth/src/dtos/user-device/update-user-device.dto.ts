import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDeviceDto {
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

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  isTrusted?: boolean;
}
