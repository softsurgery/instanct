import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from '@softsurgery/nsa-database';
import { PageDto } from '@softsurgery/nsa-database';
import { toDto, toDtoArray } from '@softsurgery/nsa-database';
import { DeviceInfoService } from '../services/device-info.service';
import { ResponseDeviceInfoDto } from '../dtos/device-info/response-device-info.dto';
import { CreateDeviceInfoDto } from '../dtos/device-info/create-device-info.dto';
import { LogInterceptor } from '@softsurgery/nsa-logger/decorators/logger.interceptor';
import { LogEvent } from '@softsurgery/nsa-logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';

@ApiTags('device-info')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/device-info',
})
export class DeviceInfoController {
  constructor(private readonly deviceInfoService: DeviceInfoService) {}

  @Get('/list')
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseDeviceInfoDto>> {
    const paginated = await this.deviceInfoService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseDeviceInfoDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseDeviceInfoDto[]> {
    return toDtoArray(
      ResponseDeviceInfoDto,
      await this.deviceInfoService.findAll(options),
    );
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<ResponseDeviceInfoDto | null> {
    return toDto(
      ResponseDeviceInfoDto,
      await this.deviceInfoService.findOneById(id),
    );
  }

  @Post()
  @LogEvent(EventType.DEVICE_INFO_CREATE)
  async create(
    @Body() createDeviceInfoDto: CreateDeviceInfoDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseDeviceInfoDto> {
    const deviceInfo = await this.deviceInfoService.save(createDeviceInfoDto);
    req.logInfo = {
      deviceId: deviceInfo.id,
      platform: deviceInfo.platform,
      model: deviceInfo.model,
    };
    return toDto(ResponseDeviceInfoDto, deviceInfo);
  }

  @Delete(':id')
  @LogEvent(EventType.DEVICE_INFO_DELETE)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseDeviceInfoDto | null> {
    const deviceInfo = await this.deviceInfoService.findOneById(id);
    await this.deviceInfoService.softDelete(id);
    req.logInfo = {
      deviceId: id,
      platform: deviceInfo?.platform,
      model: deviceInfo?.model,
    };
    return toDto(ResponseDeviceInfoDto, deviceInfo);
  }
}
