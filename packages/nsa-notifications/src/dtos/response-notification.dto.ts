import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { NotificationType } from '../enums/notification-type.registry';
import { ResponseAbstractUserDto } from '@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto';
import { getUserDto } from '@softsurgery/nsa-um/registries/user-binding.registry';

export class ResponseNotificationDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({
    type: String,
    enum: NotificationType,
    example: NotificationType.TEST,
  })
  @Expose()
  type: NotificationType;

  @ApiProperty({ type: String, example: '1' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user: ResponseAbstractUserDto;

  @ApiProperty({ type: Object })
  @Expose()
  payload?: unknown;

  @ApiProperty({ type: Date, nullable: true })
  @Expose()
  readAt?: Date;
}
