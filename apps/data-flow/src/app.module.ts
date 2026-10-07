import { Module } from "@nestjs/common";

import { DataFlowService } from "./services/data-flow.service";
import { ConfigService } from "./services/config.service";
import { DriveService } from "./services/drive.service";
import { DumpService } from "./services/dump.service";

@Module({
  providers: [ConfigService, DumpService, DriveService, DataFlowService],
})
export class AppModule {}
