import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';
import { ResponseConfigurationParamDto } from '../paramater/response-configuration-param.dto';

export class ResponseConfigurationNamespaceDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  description?: string;

  @ApiProperty({ type: () => [ResponseConfigurationParamDto] })
  @Expose()
  @Type(() => ResponseConfigurationParamDto)
  params?: ResponseConfigurationParamDto[];
}
