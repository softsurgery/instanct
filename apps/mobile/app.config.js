const { version } = require("./package.json");

export default ({ config }) => ({
  ...config,
  name: "Instanct",
  slug: "instanct-mobile-app",
  version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.instanct.instanctma",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.instanct.instanctma",
    infoPlist: {
      UIDesignRequiresCompatibility: true,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true
      }
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    softwareKeyboardLayoutMode: "pan",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.instanct.instanctma",
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
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
      }
    ],
    "expo-video",
    [
      "@sentry/react-native/expo",
      {
        url: process.env.SENTRY_URL,
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
});
