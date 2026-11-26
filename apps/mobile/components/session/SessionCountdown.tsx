import { cn, useCountdown } from "@softsurgery/lib";
import { ResponseSessionDto } from "api-client";
import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

interface SessionCountdownProps {
  session: ResponseSessionDto;
  isActive?: boolean;
  classNames?: {
    wrapper?: string;
    text?: string;
  };
  styles?: {
    wrapper?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
}

export const SessionCountdown = ({
  styles,
  session,
  isActive = true,
  classNames,
}: SessionCountdownProps) => {
  const targetDate = session.plannedEnd ?? session.ended;
  const { formatted, isExpired } = useCountdown(targetDate, isActive);

  if (!targetDate) {
    return null;
  }

  return (
    <View
      className={cn("flex-row items-center gap-1", classNames?.wrapper)}
      style={styles?.wrapper}
    >
      <Text
        className={cn(
          "font-bold tabular-nums",
          isExpired ? "text-destructive" : "text-foreground",
          classNames?.text,
        )}
        style={styles?.text}
      >
        {formatted}
      </Text>
    </View>
  );
};
