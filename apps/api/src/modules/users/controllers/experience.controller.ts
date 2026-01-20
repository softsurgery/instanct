import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { ExperienceService } from '../services/experience.service';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { ResponseExperienceDto } from '../dtos/experience/response-experience.dto';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';

@ApiTags('experience')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/experience',
})
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  async findOne(
    @Query() query: IQueryObject,
  ): Promise<ResponseExperienceDto | null> {
    return toDto(
      ResponseExperienceDto,
      await this.experienceService.findOneByCondition(query),
    );
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseExperienceDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExperienceDto>> {
    const paginated = await this.experienceService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseExperienceDto, paginated.data),
    };
  }
}
