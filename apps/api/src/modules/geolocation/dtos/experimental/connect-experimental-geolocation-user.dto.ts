import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ConnectExperimentalGeolocationUserDto {
  @ApiPropertyOptional({
    description: 'Optional latitude to assign to the user in experimental mode',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description:
      'Optional longitude to assign to the user in experimental mode',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
