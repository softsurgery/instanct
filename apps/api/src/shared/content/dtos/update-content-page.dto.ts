import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateContentPageDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Length(2, 255)
  title?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(512)
  subtitle?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Length(2, 8)
  locale?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
