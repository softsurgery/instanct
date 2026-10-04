import { Injectable } from "@nestjs/common";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { folderId, loadEnvFile, required } from "../lib/env";
import { BackupError } from "../lib/error";
import type { BackupConfig } from "../types/backup-config";

@Injectable()
export class ConfigService {
  private config: BackupConfig | undefined;

  load(): BackupConfig {
    this.config ??= this.read();
    return this.config;
  }

  private read(): BackupConfig {
    const appRoot = resolve(__dirname, "../..");
    loadEnvFile(join(appRoot, ".env"));

    const database = process.env.DATABASE_NAME?.trim() || "instanct";
    if (!/^[A-Za-z0-9_-]+$/.test(database)) {
      throw new BackupError("DATABASE_NAME contains unsupported characters");
    }

    const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS ?? "14");
    if (!Number.isInteger(retentionDays) || retentionDays < 0) {
      throw new BackupError("BACKUP_RETENTION_DAYS must be a whole number");
    }

    const serviceAccountFile = resolve(required("GDRIVE_SERVICE_ACCOUNT_FILE"));
    if (!existsSync(serviceAccountFile)) {
      throw new BackupError(`Missing Google service account key at ${serviceAccountFile}`);
    }

    return {
      host: process.env.DATABASE_HOST?.trim() || "localhost",
      port: process.env.DATABASE_PORT?.trim() || "3306",
      user: process.env.DATABASE_USERNAME?.trim() || "root",
      password: required("DATABASE_PASSWORD"),
      database,
      sslEnabled: (process.env.DATABASE_SSL_ENABLED ?? "false").toLowerCase() === "true",
      backupDir: process.env.BACKUP_DIR?.trim() || join(homedir(), "instanct-backups"),
      retentionDays,
      folderId: folderId(required("GDRIVE_FOLDER_ID")),
      serviceAccountFile,
    };
  }
}
