import { registerAs } from '@nestjs/config';

export default registerAs(
  'app',
  (): Record<string, unknown> => ({
    name: process.env.APP_NAME ?? 'Instanct API Server',
    globalPrefix: process.env.API_PREFIX ?? '/api',
    http: {
      enable: process.env.HTTP_ENABLE === 'true',
      host: process.env.APP_HOST ?? 'localhost',
      port: process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 5000,
    },

    mobile: {
      scheme: process.env.APP_MOBILE_SCHEME ?? 'exp',
      host: process.env.APP_DEBUG_MOBILE_HOST ?? 'localhost',
      port: process.env.APP_DEBUG_MOBILE_PORT
        ? Number.parseInt(process.env.APP_DEBUG_MOBILE_PORT)
        : 8081,
    },

    jobEnable: process.env.JOB_ENABLE === 'true',
    uploadPath: process.env.UPLOAD_PATH ?? '/upload',

    jwt: {
      secret: process.env.JWT_SECRET ?? 'secret',
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '1d',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '3d',
    },
  }),
);
