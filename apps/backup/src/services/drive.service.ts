import { Injectable } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { readdir, stat, unlink } from "node:fs/promises";
import { basename, join } from "node:path";

import { google } from "googleapis";

import { BackupError } from "../lib/error";
import type { DriveFile } from "../types/drive-file";
import { ConfigService } from "./config.service";

@Injectable()
export class DriveService {
  constructor(private readonly configService: ConfigService) {}

  async upload(filePath: string): Promise<string> {
    const config = this.configService.load();
    const drive = this.client();
    const created = await drive.files.create({
      requestBody: {
        name: basename(filePath),
        parents: [config.folderId],
      },
      media: {
        mimeType: "application/gzip",
        body: createReadStream(filePath),
      },
      supportsAllDrives: true,
      fields: "id",
    });
    const fileId = created.data.id;
    if (!fileId) {
      throw new BackupError("Google Drive did not return a file id");
    }
    console.log(`Uploaded ${basename(filePath)} to Drive as ${fileId}`);
    return fileId;
  }

  async prune(uploadedFileId: string): Promise<void> {
    const config = this.configService.load();
    if (config.retentionDays <= 0) {
      return;
    }

    const cutoff = Date.now() - config.retentionDays * 86_400_000;
    let names: string[] = [];
    try {
      names = await readdir(config.backupDir);
    } catch {
      names = [];
    }
    for (const name of names) {
      if (!this.isDumpName(name, config.database)) {
        continue;
      }
      const path = join(config.backupDir, name);
      if ((await stat(path)).mtimeMs < cutoff) {
        await unlink(path);
      }
    }

    const drive = this.client();
    for (const file of await this.listDumpFiles(drive, config.folderId, config.database)) {
      if (!file.id || !file.createdTime || file.id === uploadedFileId) {
        continue;
      }
      if (Date.parse(file.createdTime) >= cutoff) {
        continue;
      }
      await drive.files.delete({ fileId: file.id, supportsAllDrives: true });
      console.log(`Deleted old Drive backup ${file.name ?? file.id}`);
    }
  }

  private client() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.configService.load().serviceAccountFile,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  }

  private isDumpName(name: string, database: string): boolean {
    return name.startsWith(`${database}-`) && name.endsWith(".sql.gz");
  }

  private async listDumpFiles(
    drive: ReturnType<DriveService["client"]>,
    folderId: string,
    database: string,
  ): Promise<DriveFile[]> {
    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, createdTime)",
        pageSize: 100,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const file of response.data.files ?? []) {
        if (file.name && this.isDumpName(file.name, database)) {
          files.push(file);
        }
      }
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return files;
  }
}
