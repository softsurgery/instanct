import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { Expose } from 'class-transformer';

export class ResponseUserConnectionHistoryDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  deviceId?: string;

  @ApiProperty({ type: String, default: 'mobile' })
  @Expose()
  source: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  socketId?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  ipAddress?: string;

  @ApiProperty({ type: Number, nullable: true })
  @Expose()
  latitude?: number;

  @ApiProperty({ type: Number, nullable: true })
  @Expose()
  longitude?: number;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  location?: string;

  @ApiProperty({ type: Date, nullable: true })
  @Expose()
  disconnectedAt?: Date;
}
