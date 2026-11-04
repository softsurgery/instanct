import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';

export class ResponseBugInterestedUserDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Expose()
  bugId: number;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: () => ResponseUserDto, required: false })
  @Expose()
  @Type(() => ResponseUserDto)
  user?: ResponseUserDto;
}
