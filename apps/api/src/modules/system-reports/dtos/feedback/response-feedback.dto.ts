import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { Expose, Type } from 'class-transformer';
import { FeedbackCategory } from '../../enums/feedback-category.enum';
import { ResponseUserDeviceDto } from '@softsurgery/nsa-auth/dtos/user-device/response-user-device.dto';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';

export class ResponseFeedbackDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String, enum: FeedbackCategory })
  @Expose()
  category: FeedbackCategory;

  @ApiProperty({ type: String })
  @Expose()
  message: string;

  @ApiProperty({ type: Number })
  @Expose()
  rating?: number;

  @ApiProperty({ type: () => ResponseUserDeviceDto, required: false })
  @Expose()
  @Type(() => ResponseUserDeviceDto)
  device?: ResponseUserDeviceDto;

  @ApiProperty({ type: String, required: false })
  @Expose()
  deviceId?: string;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user?: ResponseUserDto;
}
