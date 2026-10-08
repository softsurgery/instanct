import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'nsa-database';
import { Expose, Type } from 'class-transformer';
import { ResponseStorageDto } from 'nsa-storage/dtos/response-storage.dto';

export class ResponseMessageUploadDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Expose()
  messageId: number;

  @ApiProperty({ type: Number })
  @Expose()
  uploadId: number;

  @ApiProperty({ type: () => ResponseStorageDto })
  @Expose()
  @Type(() => ResponseStorageDto)
  upload?: ResponseStorageDto;

  @ApiProperty({ type: Number })
  @Expose()
  order: number;
}
