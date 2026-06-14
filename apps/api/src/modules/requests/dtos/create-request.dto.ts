import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  receiverIds: string[];

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ type: Number, nullable: true })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ type: Number, nullable: true })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ type: Date, nullable: true })
  @IsDateString()
  @IsOptional()
  time?: Date;
}
