import React from "react";
import { useColorScheme } from "nativewind";

export type Palette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

export type ThemeType = {
  light: Palette;
  dark: Palette;
};

const PaletteContext = React.createContext<ThemeType | null>(null);

export const PaletteProvider = ({
  theme,
  children,
}: {
  theme: ThemeType;
  children: React.ReactNode;
}) => {
  return (
    <PaletteContext.Provider value={theme}>{children}</PaletteContext.Provider>
  );
};

export const useColorPalette = () => {
  const theme = React.useContext(PaletteContext);
  if (!theme) {
    throw new Error("useColorPalette must be used within a PaletteProvider");
  }
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  return {
    colorScheme,
    palette: isDarkColorScheme ? theme.dark : theme.light,
  };
};

export function hslToHex(hslString: string, opacity: number = 1): string {
  const match = hslString.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?(?:[\s,]+)(\d+(?:\.\d+)?)%(?:[\s,]+)(\d+(?:\.\d+)?)%(?:\s*(?:\/|,)\s*(\d*\.?\d+))?\s*\)/i,
  );

  if (!match) {
    return hslString;
  }

  let h = (parseFloat(match[1]) % 360) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const inputAlpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  const alpha = Math.max(0, Math.min(1, inputAlpha * opacity));

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (value: number): string =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (alpha >= 1) {
    return hex;
  }

  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  return `${hex}${alphaHex}`;
}
