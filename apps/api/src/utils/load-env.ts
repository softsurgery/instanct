import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) {
    return;
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(path);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require('dotenv') as { config: (options: { path: string }) => void }).config(
    { path },
  );
}

export function loadEnv() {
  loadEnvFile('.env');
  if (process.env.NODE_ENV) {
    loadEnvFile(`.env.${process.env.NODE_ENV}`);
  }
}
