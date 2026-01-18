import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { Expose, Type } from 'class-transformer';
import { ResponseUploadDto } from 'src/shared/uploads/dtos/response-upload.dto';
import { ResponseUserDto } from '../user/response-user.dto';

export class ResponseUserUploadDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: () => ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user?: ResponseUserDto;

  @ApiProperty({ type: Number })
  @Expose()
  uploadId: number;

  @ApiProperty({ type: () => ResponseUploadDto })
  @Expose()
  @Type(() => ResponseUploadDto)
  upload?: ResponseUploadDto;

  @ApiProperty({ type: Number })
  @Expose()
  order: number;
}
