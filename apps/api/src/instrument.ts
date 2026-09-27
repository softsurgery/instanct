import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as Sentry from '@sentry/nestjs';
import { loadEnv } from './utils/load-env';

// Read at runtime so package.json stays outside the TypeScript program.
// Importing it would make tsc emit under dist/src instead of dist/.
const { name, version } = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
) as { name: string; version: string };

// Sentry.init runs before Nest ConfigModule, so load env files here.
loadEnv();

const dsn = process.env.SENTRY_DSN;

if (!dsn) {
  console.warn(
    'Sentry is disabled: SENTRY_DSN is not set. Exceptions will not be sent to BugSink.',
  );
}

Sentry.init({
  dsn,
  environment: process.env.NODE_ENV || 'development',
  release: `${name}@${version}`,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  enabled: Boolean(dsn),
});
