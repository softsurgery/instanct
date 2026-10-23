import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { ResponseConfigurationParamDto } from '../paramater/response-configuration-param.dto';
import { ResponseAbstractUserDto } from '@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto';
import { getUserDto } from '@softsurgery/nsa-um/registries/user-binding.registry';

export class ResponseConfigurationNamespaceDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  name?: string;

  @ApiProperty({ type: String })
  @Expose()
  description?: string;

  @ApiProperty({ type: () => [ResponseConfigurationParamDto] })
  @Expose()
  @Type(() => ResponseConfigurationParamDto)
  params?: ResponseConfigurationParamDto[];

  @ApiProperty({ type: String, example: '1' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user: ResponseAbstractUserDto;
}
