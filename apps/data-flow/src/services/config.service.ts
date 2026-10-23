import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

import { folderId, loadEnvFile, required } from "../lib/env";
import { DataFlowError } from "../lib/error";
import type { DataFlowConfig, ServiceAccountCredentials } from "../types/data-flow-config";

@Injectable()
export class ConfigService implements OnModuleInit {
  private config: DataFlowConfig | undefined;

  onModuleInit(): void {
    this.load();
  }

  load(): DataFlowConfig {
    this.config ??= this.read();
    return this.config;
  }

  private resolveFilePath(filePath: string, appRoot: string): string {
    if (isAbsolute(filePath)) {
      return filePath;
    }
    const fromCwd = resolve(process.cwd(), filePath);
    if (existsSync(fromCwd)) {
      return fromCwd;
    }
    const fromAppRoot = resolve(appRoot, filePath);
    if (existsSync(fromAppRoot)) {
      return fromAppRoot;
    }
    return fromAppRoot;
  }

  private read(): DataFlowConfig {
    const appRoot = resolve(__dirname, "../..");
    loadEnvFile(join(appRoot, ".env"));

    const database = process.env.DATABASE_NAME?.trim() || "instanct";
    if (!/^[A-Za-z0-9_-]+$/.test(database)) {
      throw new DataFlowError("DATABASE_NAME contains unsupported characters");
    }

    const retentionDaysRaw =
      (process.env.DATA_FLOW_RETENTION_DAYS?.trim() ||
        process.env.BACKUP_RETENTION_DAYS?.trim()) ||
      "14";
    const retentionDays = Number(retentionDaysRaw);
    if (!Number.isInteger(retentionDays) || retentionDays < 0) {
      throw new DataFlowError("DATA_FLOW_RETENTION_DAYS must be a whole number");
    }

    const rawServiceAccountFile = required("GDRIVE_SERVICE_ACCOUNT_FILE");
    const serviceAccountFile = this.resolveFilePath(rawServiceAccountFile, appRoot);
    if (!existsSync(serviceAccountFile)) {
      throw new DataFlowError(`Missing Google service account key file at ${serviceAccountFile}`);
    }

    let credentials: ServiceAccountCredentials;
    try {
      const content = readFileSync(serviceAccountFile, "utf8");
      credentials = JSON.parse(content) as ServiceAccountCredentials;
    } catch (error) {
      throw new DataFlowError(
        `Failed to parse Google service account JSON at ${serviceAccountFile}: ${(error as Error).message}`,
      );
    }

    if (credentials.type !== "service_account") {
      throw new DataFlowError(
        `Invalid Google credential type in ${serviceAccountFile}: expected "service_account", received "${credentials.type ?? "undefined"}"`,
      );
    }

    if (!credentials.private_key || !credentials.private_key.includes("BEGIN PRIVATE KEY")) {
      throw new DataFlowError(
        `Invalid or missing "private_key" in Google service account key file at ${serviceAccountFile}`,
      );
    }

    if (!credentials.client_email) {
      throw new DataFlowError(
        `Missing "client_email" in Google service account key file at ${serviceAccountFile}`,
      );
    }

    let serviceAccountEmail = credentials.client_email.trim();
    if (
      serviceAccountEmail.toLowerCase().endsWith("@gmail.com") ||
      serviceAccountEmail.toLowerCase().endsWith("@googlemail.com")
    ) {
      const match = credentials.client_x509_cert_url?.match(/metadata\/x509\/([^?]+)/);
      const certEmail = match ? decodeURIComponent(match[1] ?? "") : null;
      if (certEmail && certEmail.includes(".gserviceaccount.com")) {
        Logger.warn(
          `Detected personal email "${serviceAccountEmail}" in ${serviceAccountFile}. Using IAM service account email from certificate URL: "${certEmail}"`,
          "ConfigService",
        );
        serviceAccountEmail = certEmail;
        credentials.client_email = certEmail;
      } else {
        throw new DataFlowError(
          `"client_email" in ${serviceAccountFile} is configured as a personal email ("${serviceAccountEmail}"). Google Cloud service account keys require an IAM service account email (typically ending in .iam.gserviceaccount.com).`,
        );
      }
    }

    return {
      host: process.env.DATABASE_HOST?.trim() || "localhost",
      port: process.env.DATABASE_PORT?.trim() || "3306",
      user: process.env.DATABASE_USERNAME?.trim() || "root",
      password: required("DATABASE_PASSWORD"),
      database,
      sslEnabled: (process.env.DATABASE_SSL_ENABLED ?? "false").toLowerCase() === "true",
      dataFlowDir:
        process.env.DATA_FLOW_DIR?.trim() ||
        process.env.BACKUP_DIR?.trim() ||
        join(homedir(), "instanct-data-flows"),
      retentionDays,
      folderId: folderId(required("GDRIVE_FOLDER_ID")),
      serviceAccountFile,
      serviceAccountEmail,
      projectId: credentials.project_id,
      credentials,
    };
  }
}
