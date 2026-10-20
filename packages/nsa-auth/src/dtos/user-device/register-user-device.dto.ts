import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RegisterUserDeviceDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  macAddress?: string;

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

  @ApiProperty({ type: String, required: false, default: "signin" })
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
