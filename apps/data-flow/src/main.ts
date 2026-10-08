import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { DataFlowError } from "./lib/error";
import { DataFlowService } from "./services/data-flow.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    const outfile = await app.get(DataFlowService).run();
    Logger.log(`DataFlow complete: ${outfile}`, "DataFlow");
    await app.close();
    process.exit(0);
  } catch (error) {
    await app.close();
    if (error instanceof DataFlowError) {
      Logger.error(error.message, "DataFlow");
    } else {
      Logger.error(error, "DataFlow");
    }
    process.exit(1);
  }
}

bootstrap().catch((error: unknown) => {
  Logger.error(error, "DataFlow");
  process.exit(1);
});
