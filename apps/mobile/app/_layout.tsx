import { splashPrevented } from "@/lib/splash-screen";
import { NAV_THEME, THEME } from "@/lib/theme";
import { cn } from "@softsurgery/lib";
import { ThemeProvider } from "expo-router/react-navigation";
import { useColorScheme } from "nativewind";
import { PortalHost } from "@rn-primitives/portal";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import {
  useColorPalette,
  PaletteProvider,
  VideoThumbnailGeneratorHost,
} from "@softsurgery/mobile-components";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ApiProvider } from "@/contexts/ApiContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { usePreferencePersistStore } from "@softsurgery/hooks";
import { useVersionPersistStore } from "@/stores/useVersionPersistStore";
import { ForceUpdateGate } from "@/components/version/ForceUpdateGate";

export { ErrorBoundary } from "expo-router";

function RootLayoutContent() {
  const { colorScheme, palette } = useColorPalette();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          className={cn("flex-1 light dark:dark bg-background")}
          style={{ paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
        >
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
        </View>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isPreferenceReady = usePreferencePersistStore((state) => state.isReady);
  const isVersionReady = useVersionPersistStore((state) => state.isReady);

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
                <LoaderProvider>
                  <RootLayoutContent />
                </LoaderProvider>
              </SafeAreaProvider>
            </PersistQueryClientProvider>
          </ThemeProvider>
        </PaletteProvider>
      </ApiProvider>
    </I18nextProvider>
  );
}

export default RootLayout;
