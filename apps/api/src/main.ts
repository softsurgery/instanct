import './instrument';
import './bind-app-values';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { join } from 'path';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { branding } from './utils/branding';
import { corsConfig } from './config/cors.config';
import { MigrationService } from 'nsa-database';

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  const logger: Logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const env =
    configService.get<string>('app.env') ||
    process.env.NODE_ENV ||
    'development';

  // CORS Configuration ===================================================
  const allowedOrigins = configService.get<string[]>('app.cors.origins') ?? [];
  const debugCors = configService.get<boolean>('app.cors.debug') ?? false;

  logger.log(
    `Configured CORS allowed origins: ${
      allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'None (strict)'
    }`,
  );

  app.enableCors(corsConfig(allowedOrigins, debugCors, logger));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const validationLogger = new Logger('Validation');

        validationLogger.error(JSON.stringify(errors, null, 2));

        return errors;
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const host = configService.get<string>('app.http.host') || 'localhost';
  const port = configService.get<number>('app.http.port') || 5000;

  const globalPrefix = configService.get<string>('app.globalPrefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);

  if (env === 'development') {
    const docName =
      configService.get<string>('doc.name') || 'API Documentation';
    const docDesc =
      configService.get<string>('doc.description') ||
      'Section for describe whole APIs';
    const docVersion = configService.get<string>('doc.version') || '1.0';
    const docPrefix = configService.get<string>('doc.prefix') || '/docs';

    // Swagger ================================================================
    const documentBuild = new DocumentBuilder()
      .setTitle(docName)
      .setDescription(docDesc)
      .setVersion(docVersion)
      .addServer(`http://${host}:${port}/`, 'Local environment')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access_token',
      )
      .build();

    try {
      const document = SwaggerModule.createDocument(app, documentBuild, {
        deepScanRoutes: true,
        extraModels: [],
      });

      SwaggerModule.setup(docPrefix, app, document, {
        explorer: true,
        customSiteTitle: docName,
        customJs: [`/swagger-custom.js`],
      });
    } catch (error) {
      logger.error(error);
    }
  } else {
    logger.log('Swagger disabled - not in development environment');
  }

  await app.listen(port);

  logger.log(``);
  logger.log(`==========================================================`);
  branding(logger);
  logger.log(`Http Server running on ${await app.getUrl()}`, 'NestApplication');
  logger.log(`Timezone set to ${process.env.TZ}`);
  logger.log(`Storage driver set to ${process.env.STORAGE_DRIVER}`);
  logger.log(`==========================================================`);

  //Migrations ==========================================================
  const synchronize = configService.get<boolean>('database.synchronize');
  if (!synchronize) {
    const migrationService = app.get(MigrationService);
    const migrationPath = join(__dirname, 'assets', 'migrations');
    try {
      // Create migrations table if it does not exist
      await migrationService.createMigrationsTableIfNotExists();

      const migrationFiles = migrationService.loadMigrationFiles(migrationPath);

      const existingMigrations = await migrationService.findAll({});

      // Check if there are any migrations to run
      const needToRunMigrations = migrationService.runNeeded(
        migrationFiles,
        existingMigrations,
      );

      if (needToRunMigrations) {
        await migrationService.runMigrations(migrationPath, migrationFiles);
      }
    } catch (error) {
      logger.error('Migration process failed', error);
    }
  }
}
void bootstrap();
