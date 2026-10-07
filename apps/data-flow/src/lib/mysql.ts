import { execFileSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { delimiter, join } from "node:path";

import type { DataFlowConfig } from "../types/data-flow-config";
import { DataFlowError } from "./error";

export function resolveBinary(name: string): string {
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    if (!directory) {
      continue;
    }
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }
  throw new DataFlowError(`${name} is not installed`);
}

export function quoteCnf(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function mysqldumpHelp(binary: string): string {
  try {
    return execFileSync(binary, ["--help"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const failed = error as { stdout?: string | Buffer; stderr?: string | Buffer };
    return `${failed.stdout?.toString() ?? ""}\n${failed.stderr?.toString() ?? ""}`;
  }
}

export function dumpArgs(
  binary: string,
  defaultsFile: string,
  config: Pick<DataFlowConfig, "database" | "sslEnabled">,
): string[] {
  const helpText = mysqldumpHelp(binary);
  const args = [
    `--defaults-extra-file=${defaultsFile}`,
    "--single-transaction",
    "--quick",
    "--hex-blob",
    "--routines",
    "--triggers",
    "--default-character-set=utf8mb4",
  ];
  if (helpText.includes("--events")) {
    args.push("--events");
  }
  if (helpText.includes("--no-tablespaces")) {
    args.push("--no-tablespaces");
  }
  if (helpText.includes("--column-statistics")) {
    args.push("--column-statistics=0");
  }
  if (helpText.includes("--set-gtid-purged")) {
    args.push("--set-gtid-purged=OFF");
  }
  if (!config.sslEnabled) {
    if (helpText.includes("--ssl-mode")) {
      args.push("--ssl-mode=DISABLED");
    } else if (helpText.includes("--skip-ssl")) {
      args.push("--skip-ssl");
    }
  }
  args.push("--databases", config.database);
  return args;
}
