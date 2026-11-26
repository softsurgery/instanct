import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateExperimentalGeolocationFlagsDto {
  @ApiPropertyOptional({
    description:
      'When enabled, user positions are visible to everyone in the app even without an accepted request',
  })
  @IsOptional()
  @IsBoolean()
  positionsVisibleToEveryone?: boolean;

  @ApiPropertyOptional({
    description:
      'When enabled, shows real users currently connected to the map and broadcasts all active users over the socket',
  })
  @IsOptional()
  @IsBoolean()
  includeConnectedUsers?: boolean;
}
