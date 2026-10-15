import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const repo = "/repo";
const pruned = "/pruned";
const runtime = "/runtime";
const modulesRoot = path.join(pruned, "node_modules");

const sources = new Map();
const dirByPkg = new Map();
for (const name of fs.readdirSync(path.join(repo, "packages"))) {
  if (!name.startsWith("nsa-")) continue;
  const dist = path.join(repo, "packages", name, "dist");
  if (!fs.existsSync(path.join(dist, "index.js"))) {
    throw new Error(`missing build output for ${name}`);
  }
  const pkgPath = path.join(repo, "packages", name, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  sources.set(pkg.name, dist);
  dirByPkg.set(pkg.name, name);
}

function copyDist(dir) {
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const dist = sources.get(pkg.name);
  if (!dist) return;
  fs.rmSync(path.join(dir, "dist"), { recursive: true, force: true });
  fs.cpSync(dist, path.join(dir, "dist"), { recursive: true });
  for (const extra of ["src", "tsconfig.json"]) {
    fs.rmSync(path.join(dir, extra), { recursive: true, force: true });
  }
}

function walk(dir, visit) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === ".bin") continue;
    const full = path.join(dir, entry.name);
    let stat;
    try {
      stat = fs.lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) {
      visit(full, entry, stat);
      continue;
    }
    if (!stat.isDirectory()) continue;
    visit(full, entry, stat);
    walk(full, visit);
  }
}

walk(modulesRoot, (full, entry, stat) => {
  if (stat.isSymbolicLink()) {
    const real = fs.realpathSync(full);
    const inside = real === pruned || real.startsWith(`${pruned}${path.sep}`);
    if (inside) return;
    const pkgPath = path.join(real, "package.json");
    if (!fs.existsSync(pkgPath)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (!sources.has(pkg.name)) return;
    fs.rmSync(full, { force: true });
    fs.mkdirSync(full, { recursive: true });
    fs.copyFileSync(pkgPath, path.join(full, "package.json"));
    copyDist(full);
    return;
  }
  if (fs.existsSync(path.join(full, "package.json"))) copyDist(full);
});

// pnpm deploy nests a fresh copy of each workspace package inside every
// dependent. Nest matches providers by class identity, so those copies make
// LoggerService unresolvable. Keep one copy at the top of node_modules.
const nested = [];
walk(modulesRoot, (full, entry, stat) => {
  if (stat.isSymbolicLink() || !stat.isDirectory()) return;
  const pkgPath = path.join(full, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (sources.has(pkg.name)) {
        nested.push({ dir: full, name: pkg.name });
      }
    } catch {}
  }
});
nested.sort((left, right) => right.dir.length - left.dir.length);

let linked = 0;
for (const { dir, name } of nested) {
  const canonical = path.join(modulesRoot, name);
  if (dir === canonical || !fs.existsSync(dir)) continue;
  if (!fs.existsSync(canonical)) {
    throw new Error(`missing top-level workspace package ${name}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.symlinkSync(path.relative(path.dirname(dir), canonical), dir);
  linked += 1;
}
console.log(`deduped ${linked} nested workspace copies`);

const requireFromPruned = createRequire(path.join(pruned, "package.json"));
const requireFromConfigurations = createRequire(
  path.join(modulesRoot, "@softsurgery/nsa-configurations/package.json"),
);
const loggerFromConfigurations = requireFromConfigurations(
  "@softsurgery/nsa-logger/services/logger.service",
).LoggerService;
const loggerFromRoot = requireFromPruned(
  "@softsurgery/nsa-logger/services/logger.service",
).LoggerService;
if (loggerFromConfigurations !== loggerFromRoot) {
  throw new Error("LoggerService is still loaded from more than one copy");
}

requireFromPruned("bcrypt");
for (const name of sources.keys()) {
  const resolved = requireFromPruned.resolve(name);
  if (!resolved.startsWith(`${pruned}${path.sep}`)) {
    throw new Error(
      `${name} resolved outside the deploy directory: ${resolved}`,
    );
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(`${name} entry is missing: ${resolved}`);
  }
}
console.log(`bundled ${sources.size} workspace packages`);

// The Swagger plugin writes requires relative to /repo/packages/*/dist.
fs.rmSync(runtime, { recursive: true, force: true });
fs.mkdirSync(path.join(runtime, "apps/api"), { recursive: true });
fs.cpSync(modulesRoot, path.join(runtime, "node_modules"), {
  recursive: true,
  verbatimSymlinks: true,
});
fs.cpSync(
  path.join(repo, "apps/api/dist"),
  path.join(runtime, "apps/api/dist"),
  {
    recursive: true,
  },
);
fs.cpSync(
  path.join(repo, "apps/api/public"),
  path.join(runtime, "apps/api/public"),
  {
    recursive: true,
  },
);
fs.copyFileSync(
  path.join(repo, "apps/api/package.json"),
  path.join(runtime, "apps/api/package.json"),
);
for (const [name, dist] of sources) {
  const dirName = dirByPkg.get(name) || name;
  fs.cpSync(dist, path.join(runtime, "packages", dirName, "dist"), {
    recursive: true,
  });
}

const apiDist = path.join(runtime, "apps/api/dist");
function checkSwaggerPaths(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkSwaggerPaths(full);
      continue;
    }
    if (!entry.name.endsWith(".js")) continue;
    const text = fs.readFileSync(full, "utf8");
    const pattern = /require\((["'])(\.\.\/[^"']*packages\/[^"']+)\1\)/g;
    for (const match of text.matchAll(pattern)) {
      const target = path.resolve(path.dirname(full), match[2]);
      const file = fs.existsSync(target) ? target : `${target}.js`;
      if (!fs.existsSync(file)) {
        throw new Error(`missing swagger import ${match[2]} from ${full}`);
      }
    }
  }
}
checkSwaggerPaths(apiDist);
console.log("swagger package paths resolve");
