import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  receiversIds: string[];

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  place?: string;

  @ApiProperty({ type: Date, nullable: true })
  @IsDate()
  @IsOptional()
  time?: Date;
}
