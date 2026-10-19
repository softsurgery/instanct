import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';
import { toDtoArray } from '@softsurgery/nsa-database';
import { UserDeviceService } from '../services/user-device.service';
import { ResponseUserConnectionHistoryDto } from '../dtos/user-connection-history/response-user-connection-history.dto';

@ApiTags('user-device-history')
@Controller({ version: '1', path: '/auth/devices/history' })
@UseInterceptors(ClassSerializerInterceptor)
export class UserDeviceHistoryController {
  constructor(private readonly userDeviceService: UserDeviceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all user connection history',
    description:
      'Retrieve recent connection and presence history for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of connection history records.',
    type: [ResponseUserConnectionHistoryDto],
  })
  async getAllConnectionHistory(
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserConnectionHistoryDto[]> {
    const history = await this.userDeviceService.getUserConnectionHistory(
      req.user!.sub,
    );
    return toDtoArray(ResponseUserConnectionHistoryDto, history);
  }

  @Get(':deviceId')
  @ApiOperation({
    summary: 'Get device connection history',
    description:
      'Retrieve recent connection and presence history for a specific device.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of connection history records for the device.',
    type: [ResponseUserConnectionHistoryDto],
  })
  async getDeviceConnectionHistory(
    @Param('deviceId') deviceId: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserConnectionHistoryDto[]> {
    const history = await this.userDeviceService.getDeviceConnectionHistory(
      req.user!.sub,
      deviceId,
    );
    return toDtoArray(ResponseUserConnectionHistoryDto, history);
  }
}
