import React from "react";
import { Text } from "@instanct/mobile-ui";
import { View } from "react-native";
import { cn } from "@instanct/lib";

export interface NotFoundProps {
  className?: string;
  message?: string | string[];
  children?: React.ReactNode;
}

export const NotFound = ({
  className,
  message = "",
  children,
}: NotFoundProps) => {
  return (
    <View
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      {Array.isArray(message) ? (
        message.map((m, i) => (
          <Text key={i} className="text-lg font-thin text-center">
            {m}
          </Text>
        ))
      ) : message ? (
        <Text className="text-lg font-thin text-center">{message}</Text>
      ) : null}
      {children}
    </View>
  );
};
