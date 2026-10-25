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
];

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  extraNodeModules: {
    "@softsurgery/api-client": path.resolve(workspaceRoot, "apps/api-client"),
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
  },
  disableHierarchicalLookup: true,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
