import "@/lib/persist-storage";
import { APP_CONFIG } from "@/constants/app-config";
import { useBootstrapMonitorConfig } from "@/constants/monitor-config";
import { useBootstrapLayoutConfig } from "@/constants/layout-config";
import { useBootstrapChatConfig } from "@/constants/chat-config";
import {
  AppConfigProvider,
  ChatConfigProvider,
  LayoutConfigProvider,
  LoaderProvider,
  MonitorConfigProvider,
} from "@softsurgery/contexts";
import { splashPrevented } from "@/lib/splash-screen";
import { NAV_THEME, THEME } from "@/lib/theme";
import { cn } from "@softsurgery/lib";
import { ThemeProvider } from "expo-router/react-navigation";
import { useColorScheme } from "nativewind";
import { PortalHost } from "@rn-primitives/portal";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { Image } from "expo-image";
import React from "react";
import { AppState, Platform, TurboModuleRegistry, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { VideoThumbnailGeneratorHost } from "@softsurgery/mobile-components";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ApiProvider } from "@/contexts/ApiContext";
import { LoaderOverlay } from "@softsurgery/contexts/LoaderOverlay";
import { usePreferencePersistStore } from "@softsurgery/hooks";
import { useVersionPersistStore } from "@/stores/useVersionPersistStore";
import { ForceUpdateGate } from "@/components/version/ForceUpdateGate";
import { AppMonitorOverlay } from "@/components/monitor/AppMonitorOverlay";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { configureScreenOrientation } from "@softsurgery/mobile-lib";
import {
  hslToHex,
  PaletteProvider,
  useColorPalette,
} from "@softsurgery/mobile-hooks";

export { ErrorBoundary } from "expo-router";

function isAndroidEdgeToEdgeNativelyEnabled(): boolean {
  if (Platform.OS !== "android") return true;
  if (TurboModuleRegistry.get("RNEdgeToEdge") != null) return true;
  const deviceInfo = TurboModuleRegistry.get<{
    getConstants?: () => { isEdgeToEdge?: boolean };
  }>("DeviceInfo");
  return deviceInfo?.getConstants?.()?.isEdgeToEdge === true;
}

const ANDROID_EDGE_TO_EDGE_NATIVE = isAndroidEdgeToEdgeNativelyEnabled();

function RootLayoutContent() {
  const { colorScheme, palette } = useColorPalette();

  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(hslToHex(palette.background)).catch(
      () => {},
    );
    setAndroidNavigationBar(colorScheme === "dark" ? "dark" : "light");
  }, [colorScheme, palette.background]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background") {
        void Image.clearMemoryCache();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <KeyboardProvider
      {...(!ANDROID_EDGE_TO_EDGE_NATIVE
        ? { statusBarTranslucent: true, navigationBarTranslucent: true }
        : {})}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className={cn("flex-1 light dark:dark bg-background")}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                flex: 1,
                backgroundColor: palette.background,
              },
              keyboardHandlingEnabled: true,
              headerStyle: {
                backgroundColor: palette.background,
              },
              headerTintColor: palette.foreground,
              headerTitleStyle: {
                fontSize: 20,
                color: palette.foreground,
              },
            }}
          />
          <Toaster
            duration={1000}
            style={{
              backgroundColor: palette.card,
            }}
          />
          <PortalHost />
          <VideoThumbnailGeneratorHost />
          <ForceUpdateGate />
          <AppMonitorOverlay />
        </View>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isPreferenceReady = usePreferencePersistStore((state) => state.isReady);
  const isVersionReady = useVersionPersistStore((state) => state.isReady);
  const monitorConfig = useBootstrapMonitorConfig();
  const layoutConfig = useBootstrapLayoutConfig();
  const chatConfig = useBootstrapChatConfig();

  React.useEffect(() => {
    void configureScreenOrientation();
  }, []);

  React.useEffect(() => {
    if (!isPreferenceReady || !isVersionReady) return;

    void (async () => {
      try {
        await splashPrevented;
        await SplashScreen.hideAsync();
      } catch {
        // Splash may already be hidden (e.g. dev fast refresh).
      }
    })();
  }, [isPreferenceReady, isVersionReady]);

  return (
    <I18nextProvider i18n={i18n}>
      <ApiProvider>
        <PaletteProvider theme={THEME}>
          <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister: asyncStoragePersister,
                maxAge: 1000 * 60 * 60 * 24,
              }}
            >
              <SafeAreaProvider>
                <AppConfigProvider value={APP_CONFIG}>
                  <MonitorConfigProvider value={monitorConfig}>
                    <LayoutConfigProvider value={layoutConfig}>
                      <ChatConfigProvider value={chatConfig}>
                        <LoaderProvider>
                          <RootLayoutContent />
                          <LoaderOverlay />
                        </LoaderProvider>
                      </ChatConfigProvider>
                    </LayoutConfigProvider>
                  </MonitorConfigProvider>
                </AppConfigProvider>
              </SafeAreaProvider>
            </PersistQueryClientProvider>
          </ThemeProvider>
        </PaletteProvider>
      </ApiProvider>
    </I18nextProvider>
  );
}

export default RootLayout;
