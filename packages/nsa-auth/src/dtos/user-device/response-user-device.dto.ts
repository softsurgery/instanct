import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { Expose } from 'class-transformer';

export class ResponseUserDeviceDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: String })
  @Expose()
  fingerprint: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  deviceName?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  deviceModel?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  os?: string;

  @ApiProperty({ type: Boolean, default: true })
  @Expose()
  isTrusted: boolean;
}
