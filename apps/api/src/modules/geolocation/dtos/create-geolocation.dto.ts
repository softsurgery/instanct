import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateGeolocationDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  latitude: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  longitude?: number;
}
