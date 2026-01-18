import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { Expose, Type } from 'class-transformer';
import { ResponseAbstractUserDto } from '../abstract-user/response-abstract-user.dto';

export class ResponseFollowDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  followerId: string;

  @ApiProperty({ type: () => ResponseAbstractUserDto })
  @Expose()
  @Type(() => ResponseAbstractUserDto)
  follower?: ResponseAbstractUserDto;

  @ApiProperty({ type: String })
  @Expose()
  followingId: string;

  @ApiProperty({ type: () => ResponseAbstractUserDto })
  @Expose()
  @Type(() => ResponseAbstractUserDto)
  following?: ResponseAbstractUserDto;

  @ApiProperty({ type: Boolean })
  @Expose()
  isFollowing: boolean;
}
