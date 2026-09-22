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
    "@instanct/lib",
    "@instanct/components",
    "@instanct/contexts",
    "@instanct/i18n",
  ],
  reactStrictMode: true,
  agentRules: false,
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
