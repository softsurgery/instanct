const { version } = require("./package.json");

const APP_ICON = "./assets/images/icon.png";

export default ({ config }) => ({
  ...config,

  name: "Instanct",
  slug: "instanct-mobile-app",
  version,

  orientation: "portrait",
  icon: APP_ICON,
  scheme: "com.instanct.instanctma",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,

  ios: {
    ...config.ios,

    supportsTablet: true,
    bundleIdentifier: "com.instanct.instanctma",
    icon: APP_ICON,
    version,
    buildNumber: "1",

    config: {
      ...config.ios?.config,
      usesNonExemptEncryption: false,
    },

    infoPlist: {
      ...config.ios?.infoPlist,

      LSApplicationCategoryType: "public.app-category.social-networking",
      UIDesignRequiresCompatibility: true,

      NSAppTransportSecurity: {
        ...config.ios?.infoPlist?.NSAppTransportSecurity,
        NSAllowsArbitraryLoads: true,
      },
    },
  },

  android: {
    ...config.android,

    icon: APP_ICON,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },

    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },

    softwareKeyboardLayoutMode: "pan",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.instanct.instanctma",
    versionCode: 1,
  },

  plugins: [
    "expo-dev-client",
    "expo-font",
    "expo-localization",
    "expo-router",
    "expo-web-browser",
    "expo-asset",
    "@react-native-community/datetimepicker",
    "expo-image",
    "expo-status-bar",
    "expo-sharing",
    "expo-secure-store",

    [
      "expo-notifications",
      {
        icon: "./assets/images/android-icon-monochrome.png",
        color: "#0B3A75",
      },
    ],

    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos so you can update your profile and send images.",
        cameraPermission:
          "Allow $(PRODUCT_NAME) to use the camera so you can take a profile photo.",
        microphonePermission:
          "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],

    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location to show people and places nearby.",
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        isIosBackgroundLocationEnabled: false,
        motionUsagePermission: false,
      },
    ],

    [
      "expo-splash-screen",
      {
        image: "./assets/images/logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],

    [
      "expo-audio",
      {
        microphonePermission:
          "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],

    "expo-video",
    "expo-apple-authentication",
    "./plugins/withAppleGeneralSettings",
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    router: {},
  },
});
