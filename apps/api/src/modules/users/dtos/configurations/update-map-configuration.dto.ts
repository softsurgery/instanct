import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateUserMapConfigurationDto {
  @ApiProperty({
    description: 'Radius of the map',
    example: 0,
  })
  @IsNumber()
  radius: number;

  @ApiProperty({
    description: 'Whether to show clusters on the map',
    example: true,
  })
  clusters: boolean;

  @ApiProperty({
    description: 'Whether to show usernames on the map',
    example: true,
  })
  showUsernames: boolean;
}
