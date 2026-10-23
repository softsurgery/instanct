const { IOSConfig, withXcodeProject } = require("expo/config-plugins");

const APP_CATEGORY = "public.app-category.social-networking";

/**
 * Writes the values Xcode shows on the target General tab.
 * Info.plist alone leaves Display Name, Version, and Build blank there.
 */
function withAppleGeneralSettings(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const [, nativeTarget] = IOSConfig.Target.findFirstNativeTarget(project);
    const displayName = config.name || "Instanct";
    const version = config.ios?.version || config.version || "1.0.0";
    const buildNumber = config.ios?.buildNumber || "1";

    IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      nativeTarget.buildConfigurationList,
    ).forEach(([, item]) => {
      const settings = item.buildSettings;
      settings.INFOPLIST_KEY_CFBundleDisplayName = quote(displayName);
      settings.MARKETING_VERSION = quote(version);
      settings.CURRENT_PROJECT_VERSION = quote(buildNumber);
      settings.ASSETCATALOG_COMPILER_APPICON_NAME = "AppIcon";
      settings.INFOPLIST_KEY_LSApplicationCategoryType = quote(APP_CATEGORY);
      settings.INFOPLIST_KEY_UILaunchStoryboardName = "SplashScreen";
    });

    return config;
  });
}

function quote(value) {
  const text = String(value);
  return text.startsWith('"') ? text : `"${text}"`;
}

module.exports = withAppleGeneralSettings;
