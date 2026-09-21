import { Logger } from '@nestjs/common';

export const branding = (logger: Logger) => {
  logger.log(`██ ▄▄  ▄▄  ▄▄▄▄ ▄▄▄▄▄▄ ▄▄▄  ▄▄  ▄▄  ▄▄▄▄ ▄▄▄▄▄▄ `);
  logger.log(`██ ███▄██ ███▄▄   ██  ██▀██ ███▄██ ██▀▀▀   ██   `);
  logger.log(`██ ██ ▀██ ▄▄██▀   ██  ██▀██ ██ ▀██ ▀████   ██   `);
};
