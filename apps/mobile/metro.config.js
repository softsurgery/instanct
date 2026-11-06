const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const abstractionsRoot = path.resolve(
  workspaceRoot,
  "packages/softsurgery-abstractions",
);

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(workspaceRoot, "packages/api-client"),
  path.resolve(abstractionsRoot, "mobile-components"),
  path.resolve(abstractionsRoot, "mobile-ui"),
  path.resolve(abstractionsRoot, "hooks"),
  path.resolve(abstractionsRoot, "lib"),
  path.resolve(abstractionsRoot, "mobile-form-builder"),
  path.resolve(abstractionsRoot, "mobile-lib"),
  path.resolve(abstractionsRoot, "mobile-hooks"),
  path.resolve(abstractionsRoot, "chat-materials"),
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
    "api-client": path.resolve(workspaceRoot, "packages/api-client"),
    "@softsurgery/mobile-components": path.resolve(
      abstractionsRoot,
      "mobile-components",
    ),
    "@softsurgery/mobile-ui": path.resolve(abstractionsRoot, "mobile-ui"),
    "@softsurgery/hooks": path.resolve(abstractionsRoot, "hooks"),
    "@softsurgery/lib": path.resolve(abstractionsRoot, "lib"),
    "@softsurgery/mobile-form-builder": path.resolve(
      abstractionsRoot,
      "mobile-form-builder",
    ),
    "@softsurgery/mobile-lib": path.resolve(abstractionsRoot, "mobile-lib"),
    "@softsurgery/mobile-hooks": path.resolve(abstractionsRoot, "mobile-hooks"),
    "@softsurgery/chat-materials": path.resolve(
      abstractionsRoot,
      "chat-materials",
    ),
  },
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
