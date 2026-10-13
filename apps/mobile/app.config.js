const { version } = require("./package.json");

export default ({ config }) => ({
  ...config,

  name: "Instanct",
  slug: "instanct-mobile-app",
  version,

  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.instanct.instanctma",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,

  ios: {
    ...config.ios,

    supportsTablet: true,
    bundleIdentifier: "com.instanct.instanctma",

    // iOS App Store marketing version comes from package.json.
    // This is the build number for TestFlight/App Store uploads.
    buildNumber: "1",

    infoPlist: {
      ...config.ios?.infoPlist,

      UIDesignRequiresCompatibility: true,

      NSAppTransportSecurity: {
        ...config.ios?.infoPlist?.NSAppTransportSecurity,
        NSAllowsArbitraryLoads: true,
      },
    },
  },

  android: {
    ...config.android,

    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage:
        "./assets/images/android-icon-foreground.png",
      backgroundImage:
        "./assets/images/android-icon-background.png",
      monochromeImage:
        "./assets/images/android-icon-monochrome.png",
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

    // Android build number.
    versionCode: 1,
  },

  plugins: [
    "expo-font",
    "expo-localization",
    "expo-notifications",
    "expo-router",
    "expo-web-browser",
    "expo-asset",
    "@react-native-community/datetimepicker",
    "expo-image",
    "expo-status-bar",
    "expo-sharing",
    "expo-secure-store",

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
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    router: {},
  },
});
