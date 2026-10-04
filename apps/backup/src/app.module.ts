import { Module } from "@nestjs/common";

import { BackupService } from "./services/backup.service";
import { ConfigService } from "./services/config.service";
import { DriveService } from "./services/drive.service";
import { DumpService } from "./services/dump.service";

@Module({
  providers: [ConfigService, DumpService, DriveService, BackupService],
})
export class AppModule {}
