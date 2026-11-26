import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConnectExperimentalGeolocationUserDto } from '../dtos/experimental/connect-experimental-geolocation-user.dto';
import { UpdateExperimentalGeolocationFlagsDto } from '../dtos/experimental/update-experimental-geolocation-flags.dto';
import { UpdateExperimentalGeolocationUserLocationDto } from '../dtos/experimental/update-experimental-geolocation-user-location.dto';
import { ExperimentalGeolocationService } from '../services/experimental-geolocation.service';

@ApiTags('experimental-geolocation')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: '/experimental-geolocation',
})
export class ExperimentalGeolocationController {
  constructor(
    private readonly experimentalGeolocationService: ExperimentalGeolocationService,
  ) {}

  @Get()
  async getState() {
    return this.experimentalGeolocationService.getState();
  }

  @Put('flags')
  async updateFlags(@Body() dto: UpdateExperimentalGeolocationFlagsDto) {
    return this.experimentalGeolocationService.updateFlags(dto);
  }

  @Post('users/:userId/connect')
  async connectUser(
    @Param('userId') userId: string,
    @Body() dto: ConnectExperimentalGeolocationUserDto,
  ) {
    return this.experimentalGeolocationService.connectUser(userId, dto);
  }

  @Post('users/:userId/disconnect')
  async disconnectUser(@Param('userId') userId: string) {
    return this.experimentalGeolocationService.disconnectUser(userId);
  }

  @Put('users/:userId/location')
  async updateUserLocation(
    @Param('userId') userId: string,
    @Body() dto: UpdateExperimentalGeolocationUserLocationDto,
  ) {
    return this.experimentalGeolocationService.upsertUserLocation(
      userId,
      dto.latitude,
      dto.longitude,
    );
  }
}
