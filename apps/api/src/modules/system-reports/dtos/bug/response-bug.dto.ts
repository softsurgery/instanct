import { ApiProperty } from '@nestjs/swagger';
import { BugVariant } from '../../enums/bug-variant.enum';
import { BugStatus } from '../../enums/bug-status.enum';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDeviceDto } from '@softsurgery/nsa-auth/dtos/user-device/response-user-device.dto';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';

export class ResponseBugDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String, enum: BugVariant })
  @Expose()
  variant: BugVariant;

  @ApiProperty({ type: String, enum: BugStatus })
  @Expose()
  status: BugStatus;

  @ApiProperty({ type: String })
  @Expose()
  title: string;

  @ApiProperty({ type: String })
  @Expose()
  description: string;

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
