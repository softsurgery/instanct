import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';

export class ResponseTemplateDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String, required: false })
  @Expose()
  name?: string;

  @ApiProperty({ type: String, required: false })
  @Expose()
  content?: string;

  @ApiProperty({ type: Number })
  @Expose()
  size: number;
}
