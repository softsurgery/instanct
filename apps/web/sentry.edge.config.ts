import * as Sentry from '@sentry/nextjs';
import { sentryRelease } from './sentry-release';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: sentryRelease,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
