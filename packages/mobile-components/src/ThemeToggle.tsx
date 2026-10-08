import { setAndroidNavigationBar } from "./lib/android-navigation-bar";
import { cn } from "@instanct/lib";
import { usePreferencePersistStore } from "@instanct/hooks";
import { MoonStar, Sun, SunMoon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Appearance, Platform, View } from "react-native";
import { Icon } from "@instanct/mobile-ui";
import { Select } from "./Select";
import { useTranslation } from "react-i18next";

interface ThemeToggleProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
  showSystemOption?: boolean;
}

export function ThemeToggle({
  classNames,
  showSystemOption = true,
}: ThemeToggleProps) {
  const { setColorScheme } = useColorScheme();
  const { theme, setTheme } = usePreferencePersistStore();
  const { t } = useTranslation("common");

  const options = [
    { label: t("theme.light"), value: "light" },
    { label: t("theme.dark"), value: "dark" },
  ];
  if (showSystemOption) {
    options.push({ label: t("theme.system"), value: "system" });
  }

  return (
    <Select
      classNames={classNames}
      title={t("theme.title")}
      description={t("theme.description")}
      placeholder="Select a theme"
      value={theme}
      onSelect={async (value) => {
        if (value === theme) return;
        const newTheme = value as "light" | "dark" | "system";
        setColorScheme(newTheme);
        if (Platform.OS === "android") {
          const activeTheme =
            newTheme === "system"
              ? Appearance.getColorScheme() === "dark"
                ? "dark"
                : "light"
              : newTheme;
          setAndroidNavigationBar(activeTheme);
        }
        setTheme(newTheme);
      }}
      options={options}
      customTrigger={
        <View className={cn("mx-2", classNames?.trigger)}>
          {theme === "system" ? (
            <Icon as={SunMoon} className="text-foreground" size={24} />
          ) : theme === "dark" ? (
            <Icon as={MoonStar} className="text-foreground" size={24} />
          ) : (
            <Icon as={Sun} className="text-foreground" size={24} />
          )}
        </View>
      }
    />
  );
}
