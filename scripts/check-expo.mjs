#!/usr/bin/env node
/**
 * Discovers Expo apps in the monorepo and runs `expo install --check` in each.
 * Validation only — never runs `--fix` or mutates dependency versions.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set([
  '.git',
  '.hg',
  '.svn',
  '.turbo',
  '.next',
  '.expo',
  '.cache',
  '.nsa-out',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'ios',
  'android',
  '__pycache__',
  '.venv',
  'venv',
]);

const EXPO_CONFIG_FILES = [
  'app.json',
  'app.config.js',
  'app.config.cjs',
  'app.config.mjs',
  'app.config.ts',
];

let interrupted = false;

function onSignal(signal) {
  interrupted = true;
  console.error(`\nReceived ${signal}; stopping after the current check…`);
}

process.on('SIGINT', () => onSignal('SIGINT'));
process.on('SIGTERM', () => onSignal('SIGTERM'));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function detectPackageManager() {
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = readJson(pkgPath);
    const field = pkg.packageManager;
    if (typeof field === 'string') {
      const name = field.split('@')[0];
      if (name === 'pnpm' || name === 'yarn' || name === 'npm' || name === 'bun') {
        return name;
      }
    }
  }

  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml')) || fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(root, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(root, 'bun.lockb')) || fs.existsSync(path.join(root, 'bun.lock'))) {
    return 'bun';
  }
  if (fs.existsSync(path.join(root, 'package-lock.json'))) return 'npm';
  return 'npm';
}

function hasExpoDependency(pkg) {
  return Boolean(pkg.dependencies?.expo || pkg.devDependencies?.expo);
}

function hasExpoConfig(dir) {
  return EXPO_CONFIG_FILES.some((name) => fs.existsSync(path.join(dir, name)));
}

/**
 * Expo apps declare `expo` in dependencies/devDependencies, or (in monorepos that
 * hoist `expo` to the workspace root) ship a root-level Expo app config.
 * Peer-only consumers and the workspace root itself are not treated as apps.
 */
function isExpoApp(dir, pkg) {
  if (path.resolve(dir) === root) return false;
  return hasExpoDependency(pkg) || hasExpoConfig(dir);
}

function discoverExpoApps(dir = root, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = readJson(pkgPath);
      if (isExpoApp(dir, pkg)) {
        found.push({
          dir,
          name: typeof pkg.name === 'string' && pkg.name ? pkg.name : path.relative(root, dir) || '.',
          relative: path.relative(root, dir) || '.',
        });
      }
    } catch (error) {
      console.warn(
        `Skipping unreadable package.json at ${path.relative(root, pkgPath) || 'package.json'}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) {
      continue;
    }
    discoverExpoApps(path.join(dir, entry.name), found);
  }

  return found;
}

function resolveExpoInvocation(packageManager) {
  const localBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'expo.cmd' : 'expo');
  if (fs.existsSync(localBin)) {
    return { command: localBin, argsPrefix: [], label: localBin };
  }

  switch (packageManager) {
    case 'pnpm':
      return { command: 'pnpm', argsPrefix: ['exec', 'expo'], label: 'pnpm exec expo' };
    case 'yarn':
      return { command: 'yarn', argsPrefix: ['exec', 'expo'], label: 'yarn exec expo' };
    case 'bun':
      return { command: 'bunx', argsPrefix: ['expo'], label: 'bunx expo' };
    default:
      return { command: 'npx', argsPrefix: ['expo'], label: 'npx expo' };
  }
}

function runCheck(app, invocation) {
  const args = [...invocation.argsPrefix, 'install', '--check'];
  console.log(`\n▶ ${app.name} (${app.relative})`);
  console.log(`  $ ${invocation.label} install --check`);

  const result = spawnSync(invocation.command, args, {
    cwd: app.dir,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.log(`  ✖ Failed to start command: ${result.error.message}`);
    return false;
  }

  if (result.signal) {
    console.log(`  ✖ Terminated by signal ${result.signal}`);
    interrupted = true;
    return false;
  }

  const status = result.status ?? 1;
  if (status === 0) {
    console.log('  ✔ Passed');
    return true;
  }

  console.log(`  ✖ Failed (exit ${status})`);
  return false;
}

function main() {
  const packageManager = detectPackageManager();
  const apps = discoverExpoApps().sort((a, b) => a.relative.localeCompare(b.relative));
  const invocation = resolveExpoInvocation(packageManager);

  console.log(`Package manager: ${packageManager}`);
  console.log(`Expo CLI: ${invocation.label}`);

  if (apps.length === 0) {
    console.error('\nNo Expo apps discovered.');
    console.error(
      'Looked for package.json files with `expo` in dependencies/devDependencies, or an Expo app config (app.json / app.config.*).',
    );
    process.exit(1);
  }

  console.log(`Found ${apps.length} Expo app${apps.length === 1 ? '' : 's'}:`);
  for (const app of apps) {
    console.log(`  - ${app.name} (${app.relative})`);
  }

  const failures = [];
  for (const app of apps) {
    if (interrupted) break;
    const ok = runCheck(app, invocation);
    if (!ok) failures.push(app);
  }

  console.log('\n── Summary ──');
  for (const app of apps) {
    const failed = failures.includes(app);
    console.log(`${failed ? '✖' : '✔'} ${app.name} (${app.relative})`);
  }

  if (interrupted) {
    console.error('\nInterrupted before all apps were checked.');
    process.exit(130);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${apps.length} Expo app check(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${apps.length} Expo app check(s) passed.`);
  process.exit(0);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
