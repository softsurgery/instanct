import { ApiProperty } from '@nestjs/swagger';
import { BugVariant } from '../../enums/bug-variant.enum';
import { BugStatus } from '../../enums/bug-status.enum';
import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateBugDto {
  @ApiProperty({ type: String, enum: BugVariant, required: false })
  @IsEnum(BugVariant)
  @IsOptional()
  variant?: BugVariant;

  @ApiProperty({ type: String, enum: BugStatus, required: false })
  @IsEnum(BugStatus)
  @IsOptional()
  status?: BugStatus;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @Length(5, 255)
  @IsOptional()
  title?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @Length(10, 1024)
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  deviceId?: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interestedUserIds?: string[];
}
