import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';

export class ResponseGeolocationDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number, nullable: true })
  @Expose()
  latitude: number | null;

  @ApiProperty({ type: Number, nullable: true })
  @Expose()
  longitude: number | null;

  @ApiProperty({ type: () => ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user: ResponseUserDto;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: Boolean })
  @Expose()
  coordinatesVisible: boolean;
}
