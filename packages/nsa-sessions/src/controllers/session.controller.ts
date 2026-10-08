import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'nsa-database';
import { ApiPaginatedResponse } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { toDtoArray } from 'nsa-database';
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

  @Get('/list')
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseSessionDto>> {
    const paginated = await this.sessionService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseSessionDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseSessionDto[]> {
    return toDtoArray(
      ResponseSessionDto,
      await this.sessionService.findAll(options),
    );
  }

  @Get('/active-list/:userId')
  @ApiPaginatedResponse(ResponseSessionDto)
  async findAllPaginatedActiveUserSessions(
    @Query() query: IQueryObject,
    @Param('userId') userId: string,
  ): Promise<PageDto<ResponseSessionDto>> {
    const paginated = await this.sessionService.findAllPaginatedUserSessions(
      query,
      userId,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseSessionDto, paginated.data),
    };
  }

  @Get('/active-all/:userId')
  async findAllActiveUserSessions(
    @Query() query: IQueryObject,
    @Param('userId') userId: string,
    @Headers('x-timezone') timezone?: string,
  ): Promise<ResponseSessionDto[]> {
    return toDtoArray(
      ResponseSessionDto,
      await this.sessionService.findAllActiveUserSessions(
        query,
        userId,
        timezone,
      ),
    );
  }
}
