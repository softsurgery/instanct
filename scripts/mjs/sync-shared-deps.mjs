#!/usr/bin/env node
/**
 * Shares mobile/Expo dependencies across `apps/mobile` and `packages/mobile-*`,
 * and keeps singleton versions in root `package.json` and `pnpm-workspace.yaml`
 * synchronized so `expo install --check` / `--fix` updates everything together.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mobilePkgPath = path.join(root, 'apps', 'mobile', 'package.json');
const rootPkgPath = path.join(root, 'package.json');
const workspaceYamlPath = path.join(root, 'pnpm-workspace.yaml');
const bundledNativeModulesPath = path.join(root, 'node_modules', 'expo', 'bundledNativeModules.json');

const SHARED_MOBILE_PACKAGES = [
  'packages/mobile-ui',
  'packages/mobile-components',
  'packages/mobile-form-builder',
];

const ROOT_MOBILE_SINGLETONS = [
  'expo',
  'nativewind',
  'react',
  'react-dom',
  'react-native',
  'react-native-css-interop',
  'react-native-reanimated',
  'react-native-worklets',
];

function cleanVersion(ver) {
  return typeof ver === 'string' ? ver.replace(/^[~^]/, '').trim() : '';
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function getInstalledVersion(pkgName) {
  const pkgJsonPath = path.join(root, 'node_modules', pkgName, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      return readJson(pkgJsonPath).version;
    } catch {
      return null;
    }
  }
  return null;
}

function sortObjectKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

export function syncSharedDeps({ preferBundled = false, preSyncOverridesWithBundled = false } = {}) {
  if (!fs.existsSync(mobilePkgPath) || !fs.existsSync(rootPkgPath)) {
    return { changed: false, overridesChanged: false };
  }

  const mobilePkg = readJson(mobilePkgPath);
  const rootPkg = readJson(rootPkgPath);
  const bundled = fs.existsSync(bundledNativeModulesPath) ? readJson(bundledNativeModulesPath) : {};

  const resolveTargetVersion = (dep) => {
    if ((preferBundled || preSyncOverridesWithBundled) && bundled[dep]) {
      return cleanVersion(bundled[dep]);
    }
    return cleanVersion(mobilePkg.dependencies?.[dep]);
  };

  mobilePkg.dependencies = mobilePkg.dependencies || {};
  let mobileChanged = false;

  // 1. Ensure all mobile singleton packages from root package.json exist in apps/mobile/package.json
  // so `expo install --check` validates them.
  for (const dep of ROOT_MOBILE_SINGLETONS) {
    if (!mobilePkg.dependencies[dep] && !mobilePkg.devDependencies?.[dep]) {
      const targetVer = bundled[dep] || rootPkg.dependencies?.[dep] || getInstalledVersion(dep);
      if (targetVer) {
        console.log(`[sync-shared-deps] Adding shared mobile dependency to apps/mobile: ${dep}@${targetVer}`);
        mobilePkg.dependencies[dep] = targetVer;
        mobileChanged = true;
      }
    }
  }

  // 2. Ensure any peerDependencies/dependencies declared in packages/mobile-* exist in apps/mobile/package.json
  // so packages/* can share Expo/RN packages with apps/mobile and have Expo validate them.
  for (const relDir of SHARED_MOBILE_PACKAGES) {
    const pkgPath = path.join(root, relDir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    const deps = { ...pkg.peerDependencies, ...pkg.dependencies };

    for (const [dep, spec] of Object.entries(deps)) {
      if (dep.startsWith('@softsurgery/')) continue;
      if (!mobilePkg.dependencies[dep] && !mobilePkg.devDependencies?.[dep]) {
        const installed = getInstalledVersion(dep);
        const fallbackVer =
          bundled[dep] ||
          (spec && spec !== '*' ? spec : null) ||
          rootPkg.dependencies?.[dep] ||
          (installed ? `^${installed}` : null);
        if (fallbackVer) {
          console.log(`[sync-shared-deps] Sharing ${dep}@${fallbackVer} (from ${relDir}) -> apps/mobile`);
          mobilePkg.dependencies[dep] = fallbackVer;
          mobileChanged = true;
        }
      }
    }
  }

  // 3. When preferBundled is enabled (e.g., before/during check:expo), align singleton versions
  // in apps/mobile with Expo's bundledNativeModules.json if Expo expects a newer version.
  if (preferBundled) {
    for (const dep of ['react-native', 'react-native-reanimated', 'react-native-worklets', 'react', 'react-dom']) {
      const expected = bundled[dep];
      if (expected && mobilePkg.dependencies[dep] && mobilePkg.dependencies[dep] !== expected) {
        console.log(`[sync-shared-deps] apps/mobile ${dep}: ${mobilePkg.dependencies[dep]} -> ${expected} (Expo bundled)`);
        mobilePkg.dependencies[dep] = expected;
        mobileChanged = true;
      }
    }
  }

  if (mobileChanged) {
    mobilePkg.dependencies = sortObjectKeys(mobilePkg.dependencies);
    writeJson(mobilePkgPath, mobilePkg);
  }

  // 4. Sync canonical versions from apps/mobile/package.json (or bundledNativeModules) -> root package.json
  let rootChanged = false;
  for (const dep of ROOT_MOBILE_SINGLETONS) {
    const mobileVer = resolveTargetVersion(dep);
    if (mobileVer && rootPkg.dependencies?.[dep] && rootPkg.dependencies[dep] !== mobileVer) {
      console.log(`[sync-shared-deps] root package.json ${dep}: ${rootPkg.dependencies[dep]} -> ${mobileVer}`);
      rootPkg.dependencies[dep] = mobileVer;
      rootChanged = true;
    }
  }

  if (rootChanged) {
    writeJson(rootPkgPath, rootPkg);
  }

  // 5. Sync canonical versions -> pnpm-workspace.yaml overrides
  let overridesChanged = false;
  if (fs.existsSync(workspaceYamlPath)) {
    const originalYaml = fs.readFileSync(workspaceYamlPath, 'utf8');
    let updatedYaml = originalYaml;

    const rnVersion = resolveTargetVersion('react-native');
    const expoVersion = resolveTargetVersion('expo');
    const reactVersion = resolveTargetVersion('react');
    const reactDomVersion = resolveTargetVersion('react-dom');
    const reanimatedVersion = resolveTargetVersion('react-native-reanimated');
    const workletsVersion = resolveTargetVersion('react-native-worklets');
    const nativewindVersion = resolveTargetVersion('nativewind');
    const cssInteropVersion = resolveTargetVersion('react-native-css-interop');

    const replacements = [
      ['react-native', rnVersion],
      ['"@react-native/virtualized-lists"', rnVersion],
      ['"react-i18next>react-native"', rnVersion],
      ['"next-i18next>react-native"', rnVersion],
      ['expo', expoVersion],
      ['react', reactVersion],
      ['react-dom', reactDomVersion],
      ['react-native-reanimated', reanimatedVersion],
      ['react-native-worklets', workletsVersion],
      ['nativewind', nativewindVersion],
      ['react-native-css-interop', cssInteropVersion],
    ];

    for (const [key, val] of replacements) {
      if (!val) continue;
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^(\\s*${escapedKey}:\\s*)"(?!\\*)[^"]+"`, 'gm');
      updatedYaml = updatedYaml.replace(regex, `$1"${val}"`);
    }

    if (updatedYaml !== originalYaml) {
      console.log('[sync-shared-deps] Updated pnpm-workspace.yaml overrides to match apps/mobile/package.json');
      fs.writeFileSync(workspaceYamlPath, updatedYaml, 'utf8');
      overridesChanged = true;
    }
  }

  // 6. Sync any non-wildcard shared dependency versions in packages/mobile-*
  let packagesChanged = false;
  for (const relDir of SHARED_MOBILE_PACKAGES) {
    const pkgPath = path.join(root, relDir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    let pkgModified = false;

    for (const section of ['dependencies', 'peerDependencies']) {
      if (!pkg[section]) continue;
      for (const [dep, currentSpec] of Object.entries(pkg[section])) {
        if (dep.startsWith('@softsurgery/') || currentSpec === '*') continue;
        const mobileSpec = mobilePkg.dependencies[dep];
        if (mobileSpec && currentSpec !== mobileSpec) {
          console.log(`[sync-shared-deps] ${relDir} ${section}.${dep}: ${currentSpec} -> ${mobileSpec}`);
          pkg[section][dep] = mobileSpec;
          pkgModified = true;
        }
      }
    }

    if (pkgModified) {
      writeJson(pkgPath, pkg);
      packagesChanged = true;
    }
  }

  return {
    changed: mobileChanged || rootChanged || overridesChanged || packagesChanged,
    overridesChanged: rootChanged || overridesChanged,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const preferBundled = process.argv.includes('--prefer-bundled');
  syncSharedDeps({ preferBundled });
}
