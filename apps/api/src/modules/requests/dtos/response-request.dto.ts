import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { ResponseSessionDto } from 'src/shared/sessions/dtos/response-session.dto';

export class ResponseRequestDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Expose()
  sessionId: number;

  @ApiProperty({ type: ResponseSessionDto })
  @Expose()
  @Type(() => ResponseSessionDto)
  session: ResponseSessionDto;

  @ApiProperty({ type: [ResponseUserDto] })
  @Expose()
  @Type(() => ResponseUserDto)
  receivers: ResponseUserDto[];

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  message?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  location?: string;

  @ApiProperty({ type: Date, nullable: true })
  @Expose()
  time?: Date;
}
