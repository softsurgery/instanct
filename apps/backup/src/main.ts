import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { BackupError } from "./lib/error";
import { BackupService } from "./services/backup.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    const outfile = await app.get(BackupService).run();
    Logger.log(`Backup complete: ${outfile}`, "Backup");
    await app.close();
    process.exit(0);
  } catch (error) {
    await app.close();
    if (error instanceof BackupError) {
      Logger.error(error.message, "Backup");
    } else {
      Logger.error(error, "Backup");
    }
    process.exit(1);
  }
}

bootstrap().catch((error: unknown) => {
  Logger.error(error, "Backup");
  process.exit(1);
});
