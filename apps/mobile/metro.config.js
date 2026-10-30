const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(workspaceRoot, "apps/api-client"),
  path.resolve(workspaceRoot, "packages/mobile-components"),
  path.resolve(workspaceRoot, "packages/mobile-ui"),
  path.resolve(workspaceRoot, "packages/hooks"),
  path.resolve(workspaceRoot, "packages/lib"),
  path.resolve(workspaceRoot, "packages/mobile-form-builder"),
  path.resolve(workspaceRoot, "packages/mobile-lib"),
  path.resolve(workspaceRoot, "packages/mobile-hooks"),
];

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

const SINGLETON_PACKAGES = ["react-i18next", "i18next"];
const mobilePkgJson = path.resolve(projectRoot, "package.json");

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  resolveRequest: (context, moduleName, platform) => {
    if (
      context.originModulePath !== mobilePkgJson &&
      (SINGLETON_PACKAGES.includes(moduleName) ||
        SINGLETON_PACKAGES.some((pkg) => moduleName.startsWith(`${pkg}/`)))
    ) {
      return context.resolveRequest(
        {
          ...context,
          originModulePath: mobilePkgJson,
        },
        moduleName,
        platform,
      );
    }
    return context.resolveRequest(context, moduleName, platform);
  },
  extraNodeModules: {
    "api-client": path.resolve(workspaceRoot, "apps/api-client"),
    "@softsurgery/mobile-components": path.resolve(
      workspaceRoot,
      "packages/mobile-components",
    ),
    "@softsurgery/mobile-ui": path.resolve(workspaceRoot, "packages/mobile-ui"),
    "@softsurgery/hooks": path.resolve(workspaceRoot, "packages/hooks"),
    "@softsurgery/lib": path.resolve(workspaceRoot, "packages/lib"),
    "@softsurgery/mobile-form-builder": path.resolve(
      workspaceRoot,
      "packages/mobile-form-builder",
    ),
    "@softsurgery/mobile-lib": path.resolve(
      workspaceRoot,
      "packages/mobile-lib",
    ),
    "@softsurgery/mobile-hooks": path.resolve(
      workspaceRoot,
      "packages/mobile-hooks",
    ),
  },
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
