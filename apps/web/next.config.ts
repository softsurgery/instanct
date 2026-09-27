import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";
import { getAllowedDevOrigins } from "../../scripts/allowed-dev-origins";
import { sentryRelease } from "./sentry-release";

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
  output: "standalone",
  turbopack: {
    root: monorepoRoot,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    disable: true,
  },
  release: {
    name: sentryRelease,
    create: false,
  },
});
