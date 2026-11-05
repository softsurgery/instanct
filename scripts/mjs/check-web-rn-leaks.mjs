// Walks the Next.js module graph (apps/web/src + workspace sources it pulls in)
// and reports any file that imports a react-native / expo / nativewind module.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const webSrc = path.join(root, "apps/web/src");

const aliases = [
  ["api-client", path.join(root, "apps/api-client/src")],
  ["@softsurgery/hooks", path.join(root, "packages/hooks/src")],
  ["@softsurgery/lib", path.join(root, "packages/lib/src")],
  ["@softsurgery/ui", path.join(root, "packages/ui/src")],
  ["@softsurgery/components", path.join(root, "packages/components/src")],
  ["@softsurgery/contexts", path.join(root, "packages/contexts/src")],
  ["@softsurgery/form-builder", path.join(root, "packages/form-builder/src")],
  [
    "@softsurgery/datatable-builder",
    path.join(root, "packages/datatable-builder/src"),
  ],
  ["@softsurgery/template", path.join(root, "packages/template/src")],
  ["@/", webSrc + "/"],
];

const NATIVE = /^(react-native(-.*|\/.*)?|expo(-.*|\/.*)?|nativewind(\/.*)?|sonner-native|@react-native(-.*)?\/.*|@rn-primitives\/.*)$/;
const EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function resolveFile(p) {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  for (const e of EXTS) if (fs.existsSync(p + e)) return p + e;
  for (const e of EXTS) {
    const i = path.join(p, "index" + e);
    if (fs.existsSync(i)) return i;
  }
  return null;
}

function resolveSpec(spec, fromFile) {
  if (spec.startsWith(".")) {
    return resolveFile(path.resolve(path.dirname(fromFile), spec));
  }
  for (const [alias, target] of aliases) {
    if (spec === alias) return resolveFile(target);
    const prefix = alias.endsWith("/") ? alias : alias + "/";
    if (spec.startsWith(prefix)) {
      return resolveFile(path.join(target, spec.slice(prefix.length)));
    }
  }
  return null;
}

const IMPORT_RE =
  /(?:import|export)[\s\S]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

function specsOf(file) {
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  for (const m of src.matchAll(IMPORT_RE)) out.push(m[1] || m[2] || m[3]);
  return out;
}

function entrypoints(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return entrypoints(p);
    return EXTS.includes(path.extname(p)) ? [p] : [];
  });
}

const seen = new Set();
const leaks = [];
const parents = new Map();
const queue = entrypoints(webSrc);
queue.forEach((f) => seen.add(f));

while (queue.length) {
  const file = queue.shift();
  for (const spec of specsOf(file)) {
    if (NATIVE.test(spec)) {
      leaks.push({ file, spec });
      continue;
    }
    const next = resolveSpec(spec, file);
    if (next && !seen.has(next)) {
      seen.add(next);
      parents.set(next, file);
      queue.push(next);
    }
  }
}

function chain(file) {
  const out = [];
  let cur = file;
  while (cur) {
    out.push(path.relative(root, cur));
    cur = parents.get(cur);
  }
  return out;
}

if (!leaks.length) {
  console.log(`OK - ${seen.size} modules scanned, no react-native imports.`);
  process.exit(0);
}

for (const { file, spec } of leaks) {
  console.log(`LEAK ${spec}\n  ${chain(file).join("\n  <- ")}\n`);
}
process.exit(1);
