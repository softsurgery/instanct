import { existsSync, readFileSync } from "node:fs";

import { BackupError } from "./error";

export function loadEnvFile(file: string): void {
  if (!existsSync(file)) {
    return;
  }

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function required(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) {
    throw new BackupError(`${name} is required`);
  }
  return value;
}

export function folderId(raw: string): string {
  let value = raw.trim().replace(/\/$/, "");
  const marker = "/folders/";
  if (value.includes("drive.google.com") && value.includes(marker)) {
    value = value.split(marker)[1]?.split("?")[0]?.split("/")[0] ?? "";
  }
  if (!value || /[\s/\\]/.test(value)) {
    throw new BackupError("GDRIVE_FOLDER_ID must be a Google Drive folder id");
  }
  return value;
}
