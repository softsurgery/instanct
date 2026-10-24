import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdvancedRequest } from "@softsurgery/nsa-helpers/http";
import { toDtoArray } from "@softsurgery/nsa-database";
import { UserConnectionHistoryService } from "../services/user-connection-history.service";
import { ResponseUserConnectionHistoryDto } from "../dtos/user-connection-history/response-user-connection-history.dto";

@ApiTags("user-device-history")
@Controller({ version: "1", path: "/auth/devices/history" })
@UseInterceptors(ClassSerializerInterceptor)
export class UserDeviceHistoryController {
  constructor(
    private readonly userConnectionHistoryService: UserConnectionHistoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all user connection history",
    description:
      "Retrieve recent connection and presence history for the authenticated user or specified user.",
  })
  @ApiResponse({
    status: 200,
    description: "List of connection history records.",
    type: [ResponseUserConnectionHistoryDto],
  })
  async getAllConnectionHistory(
    @Request() req: AdvancedRequest,
    @Query("userId") queryUserId?: string,
  ): Promise<ResponseUserConnectionHistoryDto[]> {
    const targetUserId = queryUserId || req.user!.sub;
    const history =
      await this.userConnectionHistoryService.findHistory(targetUserId);
    return toDtoArray(ResponseUserConnectionHistoryDto, history);
  }

  @Get(":deviceId")
  @ApiOperation({
    summary: "Get device connection history",
    description:
      "Retrieve recent connection and presence history for a specific device.",
  })
  @ApiResponse({
    status: 200,
    description: "List of connection history records for the device.",
    type: [ResponseUserConnectionHistoryDto],
  })
  async getDeviceConnectionHistory(
    @Param("deviceId") deviceId: string,
    @Request() req: AdvancedRequest,
    @Query("userId") queryUserId?: string,
  ): Promise<ResponseUserConnectionHistoryDto[]> {
    const targetUserId = queryUserId || req.user!.sub;
    const history = await this.userConnectionHistoryService.findHistory(
      targetUserId,
      deviceId,
    );
    return toDtoArray(ResponseUserConnectionHistoryDto, history);
  }
}
