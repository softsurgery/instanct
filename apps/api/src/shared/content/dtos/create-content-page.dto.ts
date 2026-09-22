import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateContentPageDto {
  @ApiProperty({ type: String, example: 'terms' })
  @IsString()
  @Length(2, 64)
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @ApiProperty({ type: String })
  @IsString()
  @Length(2, 255)
  title: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(512)
  subtitle?: string;

  @ApiProperty({ type: String })
  @IsString()
  body: string;

  @ApiProperty({ type: String, required: false, example: 'fr' })
  @IsString()
  @IsOptional()
  @Length(2, 8)
  locale?: string;
}
