import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllowedDevOrigins } from "../../scripts/allowed-dev-origins";

const dir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(dir, "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  transpilePackages: [
    "@instanct/ui",
    "@instanct/components",
    "@instanct/form-builder",
    "@instanct/datatable-builder",
    "@instanct/hooks",
    "@instanct/contexts",
    "@instanct/lib",
  ],
  reactStrictMode: true,
  agentRules: false,
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
