import { Injectable, Logger } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { readdir, stat, unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import { drive_v3, google } from "googleapis";

import { DataFlowError } from "../lib/error";
import type { DriveFile } from "../types/drive-file";
import { ConfigService } from "./config.service";

@Injectable()
export class DriveService {
  private driveClient: drive_v3.Drive | undefined;

  constructor(private readonly configService: ConfigService) {}

  async verifyAccess(): Promise<void> {
    const config = this.configService.load();
    const drive = this.client();
    try {
      const response = await drive.files.get({
        fileId: config.folderId,
        fields: "id, name, mimeType, capabilities, driveId",
        supportsAllDrives: true,
      });
      const file = response.data;
      if (file.mimeType !== "application/vnd.google-apps.folder") {
        throw new DataFlowError(
          `Configured Google Drive resource "${config.folderId}" is not a folder (mimeType: ${file.mimeType ?? "unknown"})`,
        );
      }
      if (file.capabilities && file.capabilities.canAddChildren === false) {
        throw new DataFlowError(
          `Service account "${config.serviceAccountEmail}" does not have write permissions for folder "${file.name ?? config.folderId}". Please grant Editor or Content manager permissions.`,
        );
      }
      Logger.log(
        `Verified Google Drive destination folder "${file.name ?? config.folderId}" (${file.driveId ? "Shared Drive" : "My Drive"})`,
        "DriveService",
      );
    } catch (error) {
      this.handleDriveError(error, "folder access verification");
    }
  }

  async upload(filePath: string): Promise<string> {
    const config = this.configService.load();
    const drive = this.client();
    const stream = createReadStream(filePath);
    try {
      const created = await drive.files.create({
        requestBody: {
          name: basename(filePath),
          parents: [config.folderId],
        },
        media: {
          mimeType: "application/gzip",
          body: stream,
        },
        supportsAllDrives: true,
        fields: "id",
      });
      const fileId = created.data.id;
      if (!fileId) {
        throw new DataFlowError("Google Drive did not return a file id");
      }
      Logger.log(`Uploaded ${basename(filePath)} to Drive as ${fileId}`, "DriveService");
      return fileId;
    } catch (error) {
      stream.destroy();
      this.handleDriveError(error, "upload");
    }
  }

  async prune(uploadedFileId: string): Promise<void> {
    const config = this.configService.load();
    if (config.retentionDays <= 0) {
      return;
    }

    const cutoff = Date.now() - config.retentionDays * 86_400_000;
    let names: string[] = [];
    try {
      names = await readdir(config.dataFlowDir);
    } catch {
      names = [];
    }
    for (const name of names) {
      if (!this.isDumpName(name, config.database)) {
        continue;
      }
      const path = join(config.dataFlowDir, name);
      try {
        if ((await stat(path)).mtimeMs < cutoff) {
          await unlink(path);
          Logger.log(`Deleted old local dump ${name}`, "DriveService");
        }
      } catch {
        // File may already have been removed
      }
    }

    try {
      const drive = this.client();
      for (const file of await this.listDumpFiles(drive, config.folderId, config.database)) {
        if (!file.id || !file.createdTime || file.id === uploadedFileId) {
          continue;
        }
        if (Date.parse(file.createdTime) >= cutoff) {
          continue;
        }
        await drive.files.delete({ fileId: file.id, supportsAllDrives: true });
        Logger.log(`Deleted old Drive dump ${file.name ?? file.id}`, "DriveService");
      }
    } catch (error) {
      Logger.warn(`Drive prune warning: ${(error as Error).message}`, "DriveService");
    }
  }

  private client(): drive_v3.Drive {
    if (this.driveClient) {
      return this.driveClient;
    }
    const config = this.configService.load();
    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials,
      keyFile: config.serviceAccountFile,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    this.driveClient = google.drive({ version: "v3", auth });
    return this.driveClient;
  }

  private isDumpName(name: string, database: string): boolean {
    return name.startsWith(`${database}-`) && name.endsWith(".sql.gz");
  }

  private async listDumpFiles(
    drive: drive_v3.Drive,
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

  private handleDriveError(error: unknown, action: string): never {
    if (error instanceof DataFlowError) {
      throw error;
    }

    const config = this.configService.load();
    const saEmail = config.serviceAccountEmail;
    const gerror = error as {
      code?: number | string;
      status?: number;
      message?: string;
      response?: {
        data?: {
          error?: string | { message?: string; errors?: unknown[] };
          error_description?: string;
        };
      };
    };

    const status = gerror.status ?? (typeof gerror.code === "number" ? gerror.code : undefined);
    const rawMsg =
      (typeof gerror.response?.data?.error === "object"
        ? gerror.response?.data?.error?.message
        : undefined) ??
      gerror.response?.data?.error_description ??
      gerror.message ??
      String(error);

    if (rawMsg.includes("invalid_grant") || gerror.response?.data?.error === "invalid_grant") {
      throw new DataFlowError(
        `Google authentication failed (invalid_grant: account not found). The service account "${saEmail}" could not be verified by Google OAuth2. Ensure the service account exists in project "${config.projectId ?? "Google Cloud"}" and the credentials file is valid.`,
      );
    }

    if (status === 404 || rawMsg.includes("File not found")) {
      throw new DataFlowError(
        `Google Drive destination folder "${config.folderId}" not found (404) during ${action}. Ensure the folder ID is correct and that the folder (or its Shared Drive) is shared with service account "${saEmail}" with Editor or Content manager permissions.`,
      );
    }

    if (rawMsg.includes("storage quota")) {
      throw new DataFlowError(
        `Google Drive upload failed: Service accounts have 0 GB storage quota in personal Google Drive ("My Drive"). The destination folder "${config.folderId}" must be located inside a Google Workspace Shared Drive with "${saEmail}" added as a member (Contributor or Content manager), or domain-wide delegation must be used.`,
      );
    }

    if (status === 403 || rawMsg.includes("Insufficient permissions")) {
      throw new DataFlowError(
        `Google Drive permission denied (403) during ${action}: ${rawMsg}. Ensure service account "${saEmail}" has Editor or Content manager permissions on destination folder "${config.folderId}".`,
      );
    }

    throw new DataFlowError(`Google Drive ${action} failed: ${rawMsg}`);
  }
}
