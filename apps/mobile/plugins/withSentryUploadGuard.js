const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

const MARKER = "# @instanct/sentry-upload-guard";

/**
 * Appends a guard to ios/.xcode.env so Xcode build phases skip Sentry
 * source map / dSYM uploads when no Sentry credentials are available
 * (e.g. local dev builds). Uploads still run whenever SENTRY_AUTH_TOKEN
 * or a .env.sentry-build-plugin file is present, or when
 * SENTRY_DISABLE_AUTO_UPLOAD is set explicitly.
 *
 * Android needs no guard: sentry.gradle already skips debug variants.
 */
const withSentryUploadGuard = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const xcodeEnvPath = path.join(
        cfg.modRequest.platformProjectRoot,
        ".xcode.env",
      );
      const existing = fs.existsSync(xcodeEnvPath)
        ? fs.readFileSync(xcodeEnvPath, "utf8")
        : "";

      if (!existing.includes(MARKER)) {
        const guard = `
${MARKER}
if [ -z "$SENTRY_DISABLE_AUTO_UPLOAD" ] && [ -z "$SENTRY_AUTH_TOKEN" ] && [ ! -f "\${PROJECT_DIR}/../.env.sentry-build-plugin" ]; then
  export SENTRY_DISABLE_AUTO_UPLOAD=true
fi
`;
        fs.writeFileSync(xcodeEnvPath, existing + guard);
      }
      return cfg;
    },
  ]);

module.exports = withSentryUploadGuard;
