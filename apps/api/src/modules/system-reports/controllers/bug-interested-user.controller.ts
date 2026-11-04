import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from '@softsurgery/nsa-logger/decorators/logger.interceptor';
import { BugInterestedUserService } from '../services/bug-interested-user.service';
import { CreateBugInterestedUserDto } from '../dtos/bug-interested-user/create-bug-interested-user.dto';
import { ResponseBugInterestedUserDto } from '../dtos/bug-interested-user/response-bug-interested-user.dto';
import {
  IQueryObject,
  PageDto,
  toDto,
  toDtoArray,
} from '@softsurgery/nsa-database';

@ApiTags('bug-interested-user')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/bug-interested-user',
})
export class BugInterestedUserController {
  constructor(
    private readonly bugInterestedUserService: BugInterestedUserService,
  ) {}

  @Get('/list')
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBugInterestedUserDto>> {
    const paginated =
      await this.bugInterestedUserService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseBugInterestedUserDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseBugInterestedUserDto[]> {
    return toDtoArray(
      ResponseBugInterestedUserDto,
      await this.bugInterestedUserService.findAll(options),
    );
  }

  @Get('/bug/:bugId')
  async findByBugId(
    @Param('bugId', ParseIntPipe) bugId: number,
  ): Promise<ResponseBugInterestedUserDto[]> {
    const entities = await this.bugInterestedUserService.findByBugId(bugId);
    return toDtoArray(ResponseBugInterestedUserDto, entities);
  }

  @Get(':id')
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseBugInterestedUserDto | null> {
    const entity = await this.bugInterestedUserService.findOneById(id);
    return toDto(ResponseBugInterestedUserDto, entity);
  }

  @Post()
  async create(
    @Body() createDto: CreateBugInterestedUserDto,
  ): Promise<ResponseBugInterestedUserDto> {
    const result = await this.bugInterestedUserService.addInterestedUser(
      createDto.bugId,
      createDto.userId,
    );
    return toDto(ResponseBugInterestedUserDto, result);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseBugInterestedUserDto | null> {
    const deleted = await this.bugInterestedUserService.delete(id);
    return toDto(ResponseBugInterestedUserDto, deleted);
  }

  @Delete('/bug/:bugId/user/:userId')
  async removeByBugAndUser(
    @Param('bugId', ParseIntPipe) bugId: number,
    @Param('userId') userId: string,
  ): Promise<ResponseBugInterestedUserDto | null> {
    const deleted = await this.bugInterestedUserService.removeInterestedUser(
      bugId,
      userId,
    );
    return toDto(ResponseBugInterestedUserDto, deleted);
  }
}
