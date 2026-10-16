import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';
import { UserDeviceService } from '../services/user-device.service';
import { UserDeviceEntity } from '../entities/user-device.entity';

@ApiTags('user-devices')
@Controller({ version: '1', path: '/auth/devices' })
export class UserDeviceController {
  constructor(private readonly userDeviceService: UserDeviceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user devices',
    description:
      'Retrieve a list of all devices tied to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of registered user devices.',
  })
  async getUserDevices(
    @Request() req: AdvancedRequest,
  ): Promise<UserDeviceEntity[]> {
    return this.userDeviceService.getUserDevices(req.user!.sub);
  }

  @Post(':id/trust')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Trust a device',
    description: 'Mark a registered device as trusted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Device successfully marked as trusted.',
  })
  async trustDevice(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<UserDeviceEntity> {
    return this.userDeviceService.trustDevice(id, req.user!.sub);
  }

  @Post(':id/untrust')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Untrust a device',
    description: 'Mark a registered device as untrusted (not allowed).',
  })
  @ApiResponse({
    status: 200,
    description: 'Device successfully marked as untrusted.',
  })
  async untrustDevice(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<UserDeviceEntity> {
    return this.userDeviceService.untrustDevice(id, req.user!.sub);
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove and log out all devices',
    description:
      'Remove and log out all registered devices of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'All devices successfully removed and logged out.',
  })
  async revokeAllDevices(
    @Request() req: AdvancedRequest,
  ): Promise<{ success: boolean }> {
    await this.userDeviceService.revokeAllDevices(req.user!.sub);
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove and log out a device',
    description: 'Remove and log out a registered device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Device successfully removed and logged out.',
  })
  async revokeDevice(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<{ success: boolean }> {
    await this.userDeviceService.revokeDevice(id, req.user!.sub);
    return { success: true };
  }
}
