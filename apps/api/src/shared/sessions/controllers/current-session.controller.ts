import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { SessionService } from '../services/session.service';
import { ResponseSessionDto } from '../dtos/response-session.dto';
import { AdvancedRequest } from 'src/types';
import { CreateSessionDto } from '../dtos/create-session.dto';

@ApiTags('current-session')
@ApiBearerAuth('access_token')
@Controller({
  version: '1',
  path: '/current-session',
})
export class CurrentSessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/list')
  async findAllUserSessions(
    @Query() query: IQueryObject,
    @Req() req: AdvancedRequest,
  ): Promise<PageDto<ResponseSessionDto>> {
    const paginated = await this.sessionService.findAllPaginatedUserSessions(
      query,
      req.user?.sub,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseSessionDto, paginated.data),
    };
  }

  @Get('/all')
  async findAllSessions(
    @Query() query: IQueryObject,
    @Req() req: AdvancedRequest,
  ): Promise<ResponseSessionDto[]> {
    return toDtoArray(
      ResponseSessionDto,
      await this.sessionService.findAllUserSessions(query, req.user?.sub),
    );
  }

  @Get('/active-list')
  @ApiPaginatedResponse(ResponseSessionDto)
  async findAllPaginatedActiveSessions(
    @Query() query: IQueryObject,
    @Req() req: AdvancedRequest,
  ): Promise<PageDto<ResponseSessionDto>> {
    const paginated =
      await this.sessionService.findAllPaginatedActiveUserSessions(
        query,
        req.user?.sub,
      );
    return {
      ...paginated,
      data: toDtoArray(ResponseSessionDto, paginated.data),
    };
  }

  @Get('/active-all')
  async findAllActiveSessions(
    @Query() query: IQueryObject,
    @Req() req: AdvancedRequest,
  ): Promise<ResponseSessionDto[]> {
    return toDtoArray(
      ResponseSessionDto,
      await this.sessionService.findAllActiveUserSessions(query, req.user?.sub),
    );
  }

  @Post('/start')
  async start(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: AdvancedRequest,
  ): Promise<ResponseSessionDto> {
    const session = await this.sessionService.start(
      createSessionDto,
      req.user?.sub,
    );
    return toDto(ResponseSessionDto, session);
  }
}
