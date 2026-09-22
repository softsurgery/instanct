import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';

export class ResponseContentPageDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  slug: string;

  @ApiProperty({ type: String })
  @Expose()
  title: string;

  @ApiProperty({ type: String })
  @Expose()
  subtitle?: string;

  @ApiProperty({ type: String })
  @Expose()
  body: string;

  @ApiProperty({ type: String })
  @Expose()
  locale: string;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  unresolvedKeys?: string[];

  @ApiProperty({ type: Boolean, required: false })
  @Expose()
  hasNotApplied?: boolean;
}
