import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateUserMapConfigurationDto {
  @ApiProperty({
    description: 'Minimum range of the map',
    example: 0,
  })
  @IsNumber()
  rangeMin: number;

  @ApiProperty({
    description: 'Maximum range of the map',
    example: 100,
  })
  @IsNumber()
  rangeMax: number;
}
