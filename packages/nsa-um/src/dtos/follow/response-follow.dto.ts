import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { Expose, Type } from 'class-transformer';
import { ResponseAbstractUserDto } from '../abstract-user/response-abstract-user.dto';
import { getUserDto } from '../../registries/user-binding.registry';

export class ResponseFollowDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  followerId: string;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  follower?: ResponseAbstractUserDto;

  @ApiProperty({ type: String })
  @Expose()
  followingId: string;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  following?: ResponseAbstractUserDto;

  @ApiProperty({ type: Boolean })
  @Expose()
  isFollowing: boolean;
}
