import { Icon, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

export interface ChatActionGridItemProps {
  className?: string;
  label: string;
  sublabel: string;
  icon: React.ElementType | React.ReactNode;
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ChatActionGridItem = ({
  label,
  sublabel,
  className,
  icon,
  iconColor,

  onPress,
  disabled,
}: ChatActionGridItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-1 items-center active:scale-95 active:opacity-80",
        disabled && "opacity-40",
        className,
      )}
    >
      <View className="mb-2 items-center justify-center">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <Icon as={icon as LucideIcon} size={26} color={iconColor} />
        )}
      </View>
      <Text className="text-center text-sm font-semibold">{label}</Text>
      <Text className="mt-px text-center text-xs text-muted-foreground">
        {sublabel}
      </Text>
    </Pressable>
  );
};
