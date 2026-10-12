import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'nsa-logger/decorators/logger.interceptor';
import { ResponseConfigurationNamespaceDto } from '../dtos/namespace/response-configuration-namespace.dto';
import { toDto, toDtoArray } from 'nsa-database';
import { IQueryObject } from 'nsa-database';
import { ConfigurationNamespaceService } from '../services/configuration-namespace.service';
import { ConfigurationParamService } from '../services/configuration-param.service';
import { UpdateConfigurationParamaterDto } from '../dtos/paramater/update-configuration-paramater.dto';

@ApiTags('configuration')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/configuration',
})
export class ConfigurationController {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
    private readonly configurationParamService: ConfigurationParamService,
  ) {}

  @Get('/namespace/global/name/:name')
  async findGlobalOneByName(
    @Param('name') name: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    return toDto(
      ResponseConfigurationNamespaceDto,
      await this.configurationNamespaceService.findGlobalByName(name),
    );
  }

  @Get('/namespace/:id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    return toDto(
      ResponseConfigurationNamespaceDto,
      await this.configurationNamespaceService.findOneById(id),
    );
  }

  @Get('/all')
  async findAll(
    @Query() query: IQueryObject,
  ): Promise<ResponseConfigurationNamespaceDto[]> {
    return toDtoArray(
      ResponseConfigurationNamespaceDto,
      await this.configurationNamespaceService.findAll(query),
    );
  }

  @Get('/all/global')
  async findAllGlobal(
    @Query() query: IQueryObject,
  ): Promise<ResponseConfigurationNamespaceDto[]> {
    return toDtoArray(
      ResponseConfigurationNamespaceDto,
      await this.configurationNamespaceService.findAllGlobal(query),
    );
  }

  @Put()
  async update(
    @Body() dtos: UpdateConfigurationParamaterDto[],
  ): Promise<ResponseConfigurationNamespaceDto> {
    return toDto(
      ResponseConfigurationNamespaceDto,
      await this.configurationParamService.updateBatchParams(dtos),
    );
  }

  @Post('/namespace')
  async createNamespace(
    @Body() dto: { name: string; description?: string },
  ): Promise<ResponseConfigurationNamespaceDto> {
    const created = await this.configurationNamespaceService.save({
      name: dto.name,
      description: dto.description,
    });
    return toDto(ResponseConfigurationNamespaceDto, created);
  }

  @Delete('/namespace/:id')
  async deleteNamespace(
    @Param('id') id: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    const entity = await this.configurationNamespaceService.findOneById(id);
    if (entity) {
      if (entity.params?.length) {
        for (const p of entity.params) {
          await this.configurationParamService.delete(p.id);
        }
      }
      await this.configurationNamespaceService.delete(id);
    }
    return toDto(ResponseConfigurationNamespaceDto, entity);
  }
}
