import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'nsa-database';
import { Expose } from 'class-transformer';

export class ResponseMessageLinkDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Expose()
  messageId: number;

  @ApiProperty({ type: String })
  @Expose()
  url: string;

  @ApiProperty({ type: Number })
  @Expose()
  startOffset: number;

  @ApiProperty({ type: Number })
  @Expose()
  endOffset: number;

  @ApiProperty({ type: Number })
  @Expose()
  order: number;
}
