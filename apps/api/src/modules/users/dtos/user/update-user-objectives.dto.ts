import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateUserObjectivesDto {
  @ApiProperty({ isArray: true, description: 'ID of objectives' })
  @IsArray()
  objectives: number[];
}
