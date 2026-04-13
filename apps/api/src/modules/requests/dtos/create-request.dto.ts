import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ type: Date, nullable: true })
  @IsDateString()
  @IsOptional()
  time?: Date;
}
