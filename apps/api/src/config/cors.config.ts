import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';
import { isOriginAllowed } from '../utils/cors.util';

export function corsConfig(
  allowedOrigins: string[],
  logger: Logger = new Logger('CORS'),
): CorsOptions {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      logger.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Range',
      'Client-Timezone',
      'x-timezone',
      'x-custom-lang',
      'sentry-trace',
      'baggage',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count', 'Content-Disposition'],
  };
}
