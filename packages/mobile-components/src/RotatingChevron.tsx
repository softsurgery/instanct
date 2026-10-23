import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Icon } from "@softsurgery/mobile-ui";
import { ChevronDown, type LucideIcon } from "lucide-react-native";
import { cn } from "@softsurgery/lib";

export interface RotatingChevronProps {
  /**
   * Whether the select/accordion is open or expanded.
   * If true, rotates to 180 degrees. If false, rotates to 0 degrees.
   */
  isOpen?: boolean;
  /**
   * Optional custom shared value (e.g. from 0 to 180 or 0 to 1) for externally driven animations.
   */
  progress?: SharedValue<number>;
  /**
   * Icon size in pixels. Defaults to 16.
   */
  size?: number;
  /**
   * Icon color. Defaults to "gray".
   */
  color?: string;
  /**
   * ClassName applied to the icon.
   */
  className?: string;
  /**
   * ClassName applied to the animated view container.
   */
  containerClassName?: string;
  /**
   * Duration in ms for the rotation animation. Defaults to 250.
   */
  duration?: number;
  /**
   * Custom Lucide icon. Defaults to ChevronDown.
   */
  icon?: LucideIcon;
}

export function RotatingChevron({
  isOpen = false,
  progress,
  size = 16,
  color = "gray",
  className,
  containerClassName,
  duration = 250,
  icon = ChevronDown,
}: RotatingChevronProps) {
  const internalRotation = useSharedValue(isOpen ? 180 : 0);

  useEffect(() => {
    if (progress === undefined) {
      internalRotation.value = withTiming(isOpen ? 180 : 0, {
        duration,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [isOpen, duration, progress]);

  const chevronStyle = useAnimatedStyle(() => {
    if (progress !== undefined) {
      const rot = progress.value <= 1 ? progress.value * 180 : progress.value;
      return {
        transform: [{ rotate: `${rot}deg` }],
      };
    }
    return {
      transform: [{ rotate: `${internalRotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={chevronStyle} className={containerClassName}>
      <Icon
        as={icon}
        size={size}
        color={color}
        className={cn("text-muted-foreground", className)}
      />
    </Animated.View>
  );
}
