import { Injectable } from "@nestjs/common";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

import { BackupError } from "../lib/error";
import { dumpArgs, quoteCnf, resolveBinary } from "../lib/mysql";
import { ConfigService } from "./config.service";

@Injectable()
export class DumpService {
  constructor(private readonly configService: ConfigService) {}

  async dump(): Promise<string> {
    const config = this.configService.load();
    const binary = resolveBinary("mysqldump");
    await mkdir(config.backupDir, { recursive: true });
    const outfile = join(config.backupDir, `${config.database}-${this.stamp()}.sql.gz`);
    const tempDir = await mkdtemp(join(tmpdir(), "instanct-backup-"));
    const defaultsFile = join(tempDir, "client.cnf");

    console.log(`Dumping ${config.database} from ${config.host}:${config.port}`);

    try {
      await writeFile(
        defaultsFile,
        [
          "[client]",
          `host=${quoteCnf(config.host)}`,
          `port=${quoteCnf(config.port)}`,
          `user=${quoteCnf(config.user)}`,
          `password=${quoteCnf(config.password)}`,
          "",
        ].join("\n"),
        { mode: 0o600 },
      );

      const child = spawn(binary, dumpArgs(binary, defaultsFile, config), {
        stdio: ["ignore", "pipe", "pipe"],
      });
      const stderrChunks: Buffer[] = [];
      child.stderr?.on("data", (chunk: Buffer) => {
        stderrChunks.push(chunk);
      });

      try {
        if (!child.stdout) {
          throw new BackupError("mysqldump produced no output");
        }
        await pipeline(child.stdout, createGzip(), createWriteStream(outfile));
      } catch (error) {
        await rm(outfile, { force: true });
        throw error;
      }

      const code = await new Promise<number>((resolve, reject) => {
        if (child.exitCode !== null) {
          resolve(child.exitCode);
          return;
        }
        child.once("error", reject);
        child.once("close", (exitCode) => resolve(exitCode ?? 1));
      });
      const stderr = Buffer.concat(stderrChunks).toString("utf8").trim();
      if (code !== 0) {
        await rm(outfile, { force: true });
        throw new BackupError(stderr || `mysqldump exited ${code}`);
      }

      if ((await stat(outfile)).size < 32) {
        await rm(outfile, { force: true });
        throw new BackupError("mysqldump wrote an empty file");
      }
      if (stderr) {
        console.log(`mysqldump warnings:\n${stderr}`);
      }
      return outfile;
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private stamp(): string {
    return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
  }
}
