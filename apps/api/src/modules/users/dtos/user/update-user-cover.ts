import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserCoverDto {
  @ApiProperty({ description: 'ID of the cover image' })
  coverId: number;
}
