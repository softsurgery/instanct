import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ResponseUserDeviceDto } from "./response-user-device.dto";
import { ResponseUserConnectionHistoryDto } from "../user-connection-history/response-user-connection-history.dto";

export class ResponseUserDeviceRegistrationDto {
  @ApiProperty({ type: () => ResponseUserDeviceDto })
  @Expose()
  @Type(() => ResponseUserDeviceDto)
  device: ResponseUserDeviceDto;

  @ApiProperty({ type: () => ResponseUserConnectionHistoryDto })
  @Expose()
  @Type(() => ResponseUserConnectionHistoryDto)
  connection: ResponseUserConnectionHistoryDto;

  @ApiProperty({ type: Boolean })
  @Expose()
  isNew: boolean;
}
