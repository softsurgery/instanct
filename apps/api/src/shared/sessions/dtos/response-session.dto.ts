import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { SessionType } from 'src/app/enums/session.enum';
import { SessionStatus } from '../enums/session-status.enum';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';

export class ResponseSessionDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number, example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ type: String, example: '1' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user: ResponseUserDto;

  @ApiProperty({ type: String, enum: SessionType })
  @Expose()
  sessionType: SessionType;

  @ApiProperty({ type: Date })
  @Expose()
  plannedStart?: Date;

  @ApiProperty({ type: Date })
  @Expose()
  plannedEnd?: Date;

  @ApiProperty({ type: Date })
  @Expose()
  started?: Date;

  @ApiProperty({ type: Date })
  @Expose()
  ended?: Date;

  @ApiProperty({ type: Object })
  @Expose()
  payload?: object;

  @ApiProperty({ type: String, enum: SessionStatus })
  @Expose()
  status: SessionStatus;
}
