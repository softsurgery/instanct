import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { toDtoArray } from 'src/shared/database/utils/dtos';
import { SessionService } from '../services/session.service';
import { ResponseSessionDto } from '../dtos/response-session.dto';

@ApiTags('session')
@ApiBearerAuth('access_token')
@Controller({
  version: '1',
  path: '/session',
})
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseSessionDto[]> {
    return toDtoArray(
      ResponseSessionDto,
      await this.sessionService.findAll(options),
    );
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseSessionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseSessionDto>> {
    const paginated = await this.sessionService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseSessionDto, paginated.data),
    };
  }
}
