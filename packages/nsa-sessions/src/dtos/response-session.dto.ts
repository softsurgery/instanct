import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { SessionType } from '../enums/session-type.registry';
import { SessionStatus } from '../enums/session-status.enum';
import { ResponseAbstractUserDto } from '@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto';
import { getUserDto } from '@softsurgery/nsa-um/registries/user-binding.registry';

export class ResponseSessionDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number, example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ type: String, example: '1' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user: ResponseAbstractUserDto;

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
