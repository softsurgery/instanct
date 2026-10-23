import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdvancedRequest } from "@softsurgery/nsa-helpers/http";
import { toDto, toDtoArray } from "@softsurgery/nsa-database";
import { UserDeviceService } from "../services/user-device.service";
import { ResponseUserDeviceDto } from "../dtos/user-device/response-user-device.dto";
import { CreateUserDeviceDto } from "../dtos/user-device/create-user-device.dto";
import { UpdateUserDeviceDto } from "../dtos/user-device/update-user-device.dto";

@ApiTags("user-devices")
@Controller({ version: "1", path: "/auth/devices" })
@UseInterceptors(ClassSerializerInterceptor)
export class UserDeviceController {
  constructor(private readonly userDeviceService: UserDeviceService) {}

  @Get()
  @ApiOperation({
    summary: "Get user devices",
    description:
      "Retrieve a list of all devices tied to the authenticated user or specified user.",
  })
  @ApiResponse({
    status: 200,
    description: "List of registered user devices.",
    type: [ResponseUserDeviceDto],
  })
  async getUserDevices(
    @Request() req: AdvancedRequest,
    @Query("userId") queryUserId?: string,
  ): Promise<ResponseUserDeviceDto[]> {
    const targetUserId = queryUserId || req.user!.sub;
    const devices = await this.userDeviceService.findByUser(targetUserId);
    return toDtoArray(ResponseUserDeviceDto, devices);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get user device by id",
    description: "Retrieve a single device by ID for the authenticated user.",
  })
  @ApiResponse({
    status: 200,
    description: "User device details.",
    type: ResponseUserDeviceDto,
  })
  async getDeviceById(@Param("id") id: string): Promise<ResponseUserDeviceDto> {
    const device = await this.userDeviceService.findOneById(id);
    return toDto(ResponseUserDeviceDto, device)!;
  }

  @Post()
  @ApiOperation({
    summary: "Create or register a user device",
    description: "Register a new device for the authenticated user.",
  })
  @ApiResponse({
    status: 201,
    description: "Registered user device.",
    type: ResponseUserDeviceDto,
  })
  async createDevice(
    @Body() createDto: CreateUserDeviceDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDeviceDto> {
    const device = await this.userDeviceService.save({
      ...createDto,
      userId: req.user!.sub,
    });
    return toDto(ResponseUserDeviceDto, device)!;
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a user device",
    description: "Update metadata for a registered user device.",
  })
  @ApiResponse({
    status: 200,
    description: "Updated user device.",
    type: ResponseUserDeviceDto,
  })
  async updateDevice(
    @Param("id") id: string,
    @Body() updateDto: UpdateUserDeviceDto,
  ): Promise<ResponseUserDeviceDto> {
    const device = await this.userDeviceService.update(id, updateDto);
    return toDto(ResponseUserDeviceDto, device)!;
  }

  @Post(":id/trust")
  @HttpCode(200)
  @ApiOperation({
    summary: "Trust a device",
    description: "Mark a registered device as trusted.",
  })
  @ApiResponse({
    status: 200,
    description: "Device successfully marked as trusted.",
    type: ResponseUserDeviceDto,
  })
  async trustDevice(@Param("id") id: string): Promise<ResponseUserDeviceDto> {
    const device = await this.userDeviceService.trustDevice(id);
    return toDto(ResponseUserDeviceDto, device)!;
  }

  @Post(":id/untrust")
  @HttpCode(200)
  @ApiOperation({
    summary: "Untrust a device",
    description: "Mark a registered device as untrusted (not allowed).",
  })
  @ApiResponse({
    status: 200,
    description: "Device successfully marked as untrusted.",
    type: ResponseUserDeviceDto,
  })
  async untrustDevice(@Param("id") id: string): Promise<ResponseUserDeviceDto> {
    const device = await this.userDeviceService.untrustDevice(id);
    return toDto(ResponseUserDeviceDto, device)!;
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({
    summary: "Remove and log out all devices",
    description:
      "Remove and log out all registered devices of the authenticated user.",
  })
  @ApiResponse({
    status: 200,
    description: "All devices successfully removed and logged out.",
  })
  async revokeAllDevices(
    @Request() req: AdvancedRequest,
  ): Promise<{ success: boolean }> {
    await this.userDeviceService.revokeAll(req.user!.sub);
    return { success: true };
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({
    summary: "Remove and log out a device",
    description: "Remove and log out a registered device.",
  })
  @ApiResponse({
    status: 200,
    description: "Device successfully removed and logged out.",
  })
  async revokeDevice(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.userDeviceService.delete(id);
    return { success: true };
  }
}
