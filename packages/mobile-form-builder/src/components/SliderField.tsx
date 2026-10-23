import { Badge, Text } from "@softsurgery/mobile-ui";
import { hslToHex, useColorPalette } from "@softsurgery/mobile-components";
import { Slider } from "@miblanchard/react-native-slider";
import * as Haptics from "expo-haptics";
import React from "react";
import { View } from "react-native";
import { cn } from "@softsurgery/lib";
import type { SliderFieldProps } from "../types";

export interface SliderFieldComponentProps extends SliderFieldProps {
  className?: string;
}

export const SliderField = ({
  className,
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  editable = true,
  unit,
  formatValue,
  showMinMaxLabels = true,
  hapticsEnabled = true,
}: SliderFieldComponentProps) => {
  const { palette } = useColorPalette();
  const [localValue, setLocalValue] = React.useState<number>(
    value ?? minimumValue ?? 0,
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleValueChange = (val: number | number[]) => {
    const nextVal = Array.isArray(val) ? val[0] : val;
    setLocalValue(nextVal);
    onValueChange?.(nextVal);
  };

  const handleSlidingComplete = (val: number | number[]) => {
    const nextVal = Array.isArray(val) ? val[0] : val;
    if (hapticsEnabled) {
      Haptics.impactAsync();
    }
    setLocalValue(nextVal);
    onSlidingComplete?.(nextVal);
  };

  const format = (v: number) => {
    if (formatValue) return formatValue(v);
    if (unit) return `${v} ${unit}`;
    return `${v}`;
  };

  return (
    <View className={cn("flex flex-col w-full", className)}>
      <Slider
        thumbTintColor={hslToHex(palette.primary)}
        minimumTrackTintColor={hslToHex(palette.primary)}
        maximumTrackTintColor={hslToHex(palette.foreground)}
        animateTransitions
        disabled={!editable}
        value={localValue}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        step={step}
      />
      {showMinMaxLabels && (
        <View className="flex flex-row justify-between mt-0.5">
          <Text className="text-sm text-muted-foreground">
            {format(minimumValue)}
          </Text>
          <Text className="text-sm font-bold text-muted-foreground">
            {format(localValue)}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {format(maximumValue)}
          </Text>
        </View>
      )}
    </View>
  );
};
