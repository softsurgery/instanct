import { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useRTL } from "./hooks/useRTL";
import { cn } from "@instanct/lib";
import { Icon, IconBadge } from "@instanct/mobile-ui";
import { Text, TextVariantDefaults } from "@instanct/mobile-ui";
import React from "react";
import { hslToHex, useColorPalette } from "./hooks/useColorPalette";
type Shortcut =
  | {
      key: string;
      icon: LucideIcon;
      onPress: () => void;
      color?: string;
      badgeText?: string;
      hidden?: boolean;
    }
  | { key: string; render: React.ReactNode; hidden?: boolean };
interface ApplicationHeaderProps {
  classNames?: { wrapper?: string; title?: string };
  title?: string | React.ReactNode;
  titleVariant?: TextVariantDefaults;
  shortcuts?: Shortcut[];
  reverse?: boolean;
}
export const ApplicationHeader = ({
  classNames,
  title,
  titleVariant = "h1",
  shortcuts,
  reverse = false,
}: ApplicationHeaderProps) => {
  const { palette } = useColorPalette();
  const color = hslToHex(palette.foreground);
  const isRTL = useRTL();

  return (
    <View
      className={cn(
        "flex flex-row items-center gap-2 px-2",
        isRTL || reverse ? "flex-row-reverse" : "flex-row",
        classNames?.wrapper,
      )}
    >
      <View className="flex-1 min-w-0">
        {typeof title === "string" ? (
          <Text
            variant={titleVariant}
            numberOfLines={1}
            ellipsizeMode="tail"
            className={cn(
              "mx-2",
              classNames?.title,
              isRTL || reverse ? "text-right" : "text-left",
            )}
          >
            {title}
          </Text>
        ) : (
          title && (
            <View
              className={cn(
                "mx-2",
                isRTL || reverse ? "flex-row-reverse" : "flex-row",
              )}
            >
              {title}
            </View>
          )
        )}
      </View>
      <View
        className={cn(
          "flex-row items-center justify-between shrink-0 gap-2",
          reverse && "flex-row-reverse",
        )}
      >
        {shortcuts?.map((shortcut) => {
          if (shortcut.hidden) return null;
          if ("icon" in shortcut) {
            return (
              <Pressable
                key={shortcut.key}
                className="p-1 rounded-full active:opacity-50"
                onPress={shortcut.onPress}
              >
                {shortcut.badgeText ? (
                  <IconBadge
                    as={shortcut.icon}
                    size={28}
                    badgeText={shortcut.badgeText}
                    color={shortcut.color || color}
                  />
                ) : (
                  <Icon
                    as={shortcut.icon}
                    size={28}
                    color={shortcut.color || color}
                  />
                )}
              </Pressable>
            );
          }
          return (
            <React.Fragment key={shortcut.key}>
              {shortcut.render}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
