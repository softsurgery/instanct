import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateUserIndustriesDto {
  @ApiProperty({ isArray: true, description: 'ID of industries' })
  @IsArray()
  industries: number[];
}
