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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { Public } from 'src/shared/auth/utils/public-strategy';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { AdvancedRequest } from 'src/types';
import { ContentPageService } from '../services/content-page.service';
import { ResponseContentPageDto } from '../dtos/response-content-page.dto';
import { CreateContentPageDto } from '../dtos/create-content-page.dto';
import { UpdateContentPageDto } from '../dtos/update-content-page.dto';

@ApiTags('content-page')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/content-pages',
})
export class ContentPageController {
  constructor(private readonly contentPageService: ContentPageService) {}

  @Public()
  @Get('/public/slug/:slug')
  async findPublishedBySlug(
    @Param('slug') slug: string,
  ): Promise<ResponseContentPageDto> {
    return toDto(
      ResponseContentPageDto,
      await this.contentPageService.getPublishedBySlug(slug),
    );
  }

  @Get('/list')
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseContentPageDto>> {
    const paginated = await this.contentPageService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseContentPageDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(
    @Query() query: IQueryObject,
  ): Promise<ResponseContentPageDto[]> {
    return toDtoArray(
      ResponseContentPageDto,
      await this.contentPageService.findAll(query),
    );
  }

  @Get('/slug/:slug')
  async findOneBySlug(
    @Param('slug') slug: string,
  ): Promise<ResponseContentPageDto> {
    return toDto(
      ResponseContentPageDto,
      await this.contentPageService.findOneBySlug(slug),
    );
  }

  @Get(':id')
  async findOneById(@Param('id') id: string): Promise<ResponseContentPageDto> {
    return toDto(
      ResponseContentPageDto,
      await this.contentPageService.findOneById(id),
    );
  }

  @Post()
  @LogEvent(EventType.CONTENT_PAGE_CREATE)
  async create(
    @Body() dto: CreateContentPageDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseContentPageDto> {
    const page = await this.contentPageService.save(dto);
    req.logInfo = { id: page.id, slug: page.slug };
    return toDto(ResponseContentPageDto, page);
  }

  @Put(':id')
  @LogEvent(EventType.CONTENT_PAGE_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentPageDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseContentPageDto> {
    const page = await this.contentPageService.update(id, dto);
    req.logInfo = { id: page.id, slug: page.slug };
    return toDto(ResponseContentPageDto, page);
  }

  @Delete(':id')
  @LogEvent(EventType.CONTENT_PAGE_DELETE)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseContentPageDto | null> {
    const page = await this.contentPageService.softDelete(id);
    req.logInfo = { id, slug: page?.slug };
    return toDto(ResponseContentPageDto, page);
  }
}
