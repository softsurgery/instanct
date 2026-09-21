import { THEME } from "../lib/theme";
import { useColorScheme } from "nativewind";

export const useColorPalette = () => {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  return {
    colorScheme,
    palette: isDarkColorScheme ? THEME.dark : THEME.light,
  };
};
