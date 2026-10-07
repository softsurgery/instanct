import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { ApiPaginatedResponse } from 'nsa-database';
import { toDto, toDtoArray } from 'nsa-database';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
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
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { RefParamService } from '../services/ref-param.service';
import { ResponseRefParamDto } from '../dtos/ref-param/response-ref-param.dto';
import { CreateRefParamDto } from '../dtos/ref-param/create-ref-param.dto';
import { UpdateRefParamDto } from '../dtos/ref-param/update-ref-param.dto';

@ApiTags('ref-param')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/ref-param',
})
export class RefParamController {
  constructor(private readonly refParamService: RefParamService) {}

  @Get('/list')
  @ApiPaginatedResponse(ResponseRefParamDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseRefParamDto>> {
    const paginated = await this.refParamService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseRefParamDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseRefParamDto[]> {
    return toDtoArray(
      ResponseRefParamDto,
      await this.refParamService.findAll(options),
    );
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<ResponseRefParamDto | null> {
    return toDto(
      ResponseRefParamDto,
      await this.refParamService.findOneById(id),
    );
  }

  @Post()
  @LogEvent(EventType.REF_PARAM_CREATE)
  async create(
    @Body() createRefParamDto: CreateRefParamDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefParamDto> {
    const refParam = await this.refParamService.save(createRefParamDto);
    req.logInfo = { id: refParam.id, label: refParam.label };
    return toDto(ResponseRefParamDto, refParam);
  }

  @Put(':id')
  @LogEvent(EventType.REF_PARAM_UPDATE)
  async update(
    @Param('id') id: number,
    @Body() updateRefParamDto: UpdateRefParamDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefParamDto | null> {
    const refParam = await this.refParamService.update(id, updateRefParamDto);
    req.logInfo = { id, label: refParam?.label };
    return toDto(ResponseRefParamDto, refParam);
  }

  @Delete(':id')
  @LogEvent(EventType.REF_PARAM_DELETE)
  async delete(
    @Param('id') id: number,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefParamDto | null> {
    const refParam = await this.refParamService.delete(id);
    req.logInfo = { id, label: refParam?.label };
    return toDto(ResponseRefParamDto, refParam);
  }
}
