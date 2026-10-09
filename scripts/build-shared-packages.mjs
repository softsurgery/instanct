import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = path.join(root, 'packages');
const outDir = path.join(packagesDir, '.nsa-out');
const lockFile = path.join(packagesDir, '.nsa-build.lock');
const stampFile = path.join(packagesDir, '.nsa-build.stamp');

const modules = [
  'um',
  'auth',
  'chat',
  'configurations',
  'content',
  'helpers',
  'logger',
  'mail',
  'notifications',
  'reference-types',
  'sentry',
  'sessions',
  'storage',
  'templates',
  'workflows',
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function newestSource(dir) {
  let max = 0;
  if (!fs.existsSync(dir)) return max;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.nsa-out') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      max = Math.max(max, newestSource(full));
    } else if (/\.(?:[cm]?ts|tsx|json)$/.test(entry.name)) {
      max = Math.max(max, fs.statSync(full).mtimeMs);
    }
  }
  return max;
}

function sourcesAreFresh() {
  if (!fs.existsSync(stampFile)) return false;
  const stamp = fs.statSync(stampFile).mtimeMs;
  const configTime = fs.statSync(path.join(packagesDir, 'tsconfig.nsa.json')).mtimeMs;
  if (configTime > stamp) return false;
  return modules.every(
    (mod) => newestSource(path.join(packagesDir, `nsa-${mod}`, 'src')) <= stamp,
  );
}

function copyOutputs() {
  for (const mod of modules) {
    const from = path.join(outDir, `nsa-${mod}`, 'src');
    const to = path.join(packagesDir, `nsa-${mod}`, 'dist');
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
  }
}

function build() {
  const tscBin = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
  const databaseDist = path.join(packagesDir, 'nsa-database', 'dist', 'index.js');
  if (!fs.existsSync(databaseDist)) {
    const databaseBuild = spawnSync(
      process.execPath,
      [tscBin, '-p', path.join(packagesDir, 'nsa-database', 'tsconfig.json')],
      { cwd: root, stdio: 'inherit' },
    );
    if (databaseBuild.status !== 0) {
      throw new Error(`nsa-database build exited with status ${databaseBuild.status ?? 1}`);
    }
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const compiled = spawnSync(
    process.execPath,
    [tscBin, '-p', path.join(packagesDir, 'tsconfig.nsa.json'), '--pretty', 'false'],
    { cwd: root, stdio: 'inherit' },
  );
  if (compiled.status !== 0) {
    throw new Error(`tsc exited with status ${compiled.status ?? 1}`);
  }

  copyOutputs();
  fs.writeFileSync(stampFile, new Date().toISOString());
}

if (sourcesAreFresh()) {
  process.exit(0);
}

let acquired = false;
for (let attempt = 0; attempt < 240; attempt += 1) {
  try {
    const fd = fs.openSync(lockFile, 'wx');
    fs.closeSync(fd);
    acquired = true;
    break;
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    if (sourcesAreFresh()) process.exit(0);
    sleep(500);
  }
}

if (!acquired) {
  console.error('Timed out waiting for the shared package build.');
  process.exit(1);
}

try {
  if (!sourcesAreFresh()) build();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  fs.rmSync(lockFile, { force: true });
}
