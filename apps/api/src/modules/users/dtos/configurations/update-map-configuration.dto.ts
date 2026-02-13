import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateUserMapConfigurationDto {
  @ApiProperty({
    description: 'Radius of the map',
    example: 0,
  })
  @IsNumber()
  radius: number;
}
