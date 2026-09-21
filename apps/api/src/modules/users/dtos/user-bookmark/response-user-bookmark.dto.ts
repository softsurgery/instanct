import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { ResponseUserDto } from '../user/response-user.dto';

export class ResponseUserBookmarkDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: () => ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user?: ResponseUserDto;

  @ApiProperty({ type: String })
  @Expose()
  bookmarkId: string;

  @ApiProperty({ type: () => ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  bookmark?: ResponseUserDto;
}
