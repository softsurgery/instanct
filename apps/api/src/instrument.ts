import * as Sentry from '@sentry/nestjs';
import { name, version } from '../package.json';
import { loadEnv } from './utils/load-env';

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
