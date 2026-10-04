import { Injectable } from "@nestjs/common";

import { DriveService } from "./drive.service";
import { DumpService } from "./dump.service";

@Injectable()
export class BackupService {
  constructor(
    private readonly dumpService: DumpService,
    private readonly driveService: DriveService,
  ) {}

  async run(): Promise<string> {
    const outfile = await this.dumpService.dump();
    const fileId = await this.driveService.upload(outfile);
    await this.driveService.prune(fileId);
    return outfile;
  }
}
