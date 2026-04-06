import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateRefTypeDto {
  @ApiProperty({ type: String })
  @IsString()
  @Length(3, 50)
  label: string;

  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ type: Object })
  @IsObject()
  extras: object;

  @ApiProperty({ type: String })
  @IsNumber()
  @IsOptional()
  parentId?: string;
}
