import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { ApiPaginatedResponse } from 'nsa-database';
import { toDto, toDtoArray } from 'nsa-database';
import { LogInterceptor } from 'nsa-logger/decorators/logger.interceptor';
import { LogEvent } from 'nsa-logger/decorators/log-event.decorator';
import { EventType } from 'nsa-logger/enums/event-type.registry';
import { AdvancedRequest } from 'nsa-helpers/http';
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
import { RefTypeService } from '../services/ref-type.service';
import { ResponseRefTypeDto } from '../dtos/ref-type/response-ref-type.dto';
import { CreateRefTypeDto } from '../dtos/ref-type/create-ref-type.dto';
import { UpdateRefTypeDto } from '../dtos/ref-type/update-ref-type.dto';
import { Public } from 'nsa-auth/utils/public-strategy';

@ApiTags('ref-type')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/ref-type',
})
export class RefTypeController {
  constructor(private readonly refTypeService: RefTypeService) {}

  @Public()
  @Get('/list')
  @ApiPaginatedResponse(ResponseRefTypeDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseRefTypeDto>> {
    const paginated = await this.refTypeService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseRefTypeDto, paginated.data),
    };
  }

  @Public()
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseRefTypeDto[]> {
    return toDtoArray(
      ResponseRefTypeDto,
      await this.refTypeService.findAll(options),
    );
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<ResponseRefTypeDto | null> {
    return toDto(ResponseRefTypeDto, await this.refTypeService.findOneById(id));
  }

  @Post()
  @LogEvent(EventType.REF_TYPE_CREATE)
  async create(
    @Body() createRefTypeDto: CreateRefTypeDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefTypeDto> {
    const refType = await this.refTypeService.save(createRefTypeDto);
    req.logInfo = { id: refType.id, label: refType.label };
    return toDto(ResponseRefTypeDto, refType);
  }

  @Put(':id')
  @LogEvent(EventType.REF_TYPE_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateRefTypeDto: UpdateRefTypeDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefTypeDto | null> {
    const refType = await this.refTypeService.update(id, updateRefTypeDto);

    req.logInfo = { id, label: refType?.label };
    return toDto(ResponseRefTypeDto, refType);
  }

  @Delete(':id')
  @LogEvent(EventType.REF_TYPE_DELETE)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRefTypeDto | null> {
    const refType = await this.refTypeService.delete(id);
    req.logInfo = {
      id,
      label: refType?.label,
    };
    return toDto(ResponseRefTypeDto, refType);
  }
}
