import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { usePreferencePersistStore } from "@softsurgery/hooks";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Appearance, View } from "react-native";
import { Image } from "expo-image";
import * as Localization from "expo-localization";

export default function Page() {
  const { i18n } = useTranslation();
  const { setColorScheme } = useColorScheme();
  const { isReady, theme, language } = usePreferencePersistStore();

  const hasBootstrapped = React.useRef(false);

  React.useEffect(() => {
    if (!isReady || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const timer = setTimeout(() => {
      setColorScheme(theme);
      if (Platform.OS === "android") {
        const activeTheme =
          theme === "system" ? (Appearance.getColorScheme() ?? "light") : theme;
        setAndroidNavigationBar(activeTheme === "dark" ? "dark" : "light");
      }

      let lang = language;
      if (lang === "system") {
        lang =
          (Localization.getLocales()[0]?.languageCode as "en" | "fr" | "ar") ||
          "en";
      }
      i18n.changeLanguage(lang);
      router.replace("/main");
    }, 2000);

    return () => clearTimeout(timer);
  }, [isReady, theme, language, setColorScheme, i18n]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image
        source={require("~/assets/images/logo.png")}
        style={{ width: 140, height: 140 }}
        contentFit="contain"
      />
    </View>
  );
}
