import { ApiProperty } from '@nestjs/swagger';
import { BugVariant } from '../../enums/bug-variant.enum';
import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateBugDto {
  @ApiProperty({ type: String, enum: BugVariant })
  @IsEnum(BugVariant)
  variant: BugVariant;

  @ApiProperty({ type: String })
  @IsString()
  @Length(5, 255)
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @Length(10, 1024)
  description: string;

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
