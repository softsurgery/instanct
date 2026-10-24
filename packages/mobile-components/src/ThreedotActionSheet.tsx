import React, { forwardRef } from "react";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import * as Haptics from "expo-haptics";
import { Keyboard, Pressable, View } from "react-native";
import { cn } from "@softsurgery/lib";
import { Ellipsis, type LucideIcon } from "lucide-react-native";
import { Icon } from "@softsurgery/mobile-ui";
import { useColorPalette } from "./hooks/useColorPalette";
import { Text } from "@softsurgery/mobile-ui";

interface ThreeDotsActionSheetProps {
  customContent?: React.ReactNode;
  customContentPosition?: "top" | "bottom";
  icon?: LucideIcon;
  size?: number;
  disabled?: boolean;
  renderTrigger?: boolean;
  options: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: LucideIcon;
  }[];
}

export const ThreeDotsActionSheet = forwardRef<
  ActionSheetRef,
  ThreeDotsActionSheetProps
>(
  (
    {
      icon,
      disabled,
      size,
      options,
      renderTrigger = true,
      customContent,
      customContentPosition = "top",
    },
    ref,
  ) => {
    const { palette } = useColorPalette();
    const sheetRef = React.useRef<ActionSheetRef>(null);

    React.useImperativeHandle(ref, () => sheetRef.current as ActionSheetRef);

    const handleClose = () => {
      Keyboard.dismiss();
    };

    return (
      <>
        {renderTrigger && (
          <Pressable
            className={cn(
              "flex justify-center rounded-full p-1 active:bg-card",
              disabled && "opacity-50 pointer-events-none",
            )}
            onPress={() => {
              if (!disabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                sheetRef.current?.show();
              }
            }}
          >
            <Icon as={icon || Ellipsis} size={size || 24} color={"gray"} />
          </Pressable>
        )}
        <ActionSheet
          ref={sheetRef}
          gestureEnabled
          statusBarTranslucent
          defaultOverlayOpacity={0.45}
          onClose={handleClose}
          containerStyle={{
            backgroundColor: palette.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: 32,
          }}
        >
          {customContent && customContentPosition === "top" && (
            <View className="mb-4">{customContent}</View>
          )}
          <View className="flex flex-col gap-2 ">
            {options.map((option) => (
              <Pressable
                key={option.label}
                disabled={option.disabled}
                onPress={async () => {
                  if (option.disabled) return;
                  await Haptics.selectionAsync();
                  option.onPress();
                  sheetRef.current?.hide();
                }}
                className={cn(
                  "flex flex-row items-center gap-2 rounded-2xl h-12 px-6 active:opacity-50",
                  option.disabled && "opacity-50",
                )}
              >
                <View
                  className={cn(
                    "h-10 w-10 items-center justify-center rounded-full bg-card",
                  )}
                >
                  {option.icon ? (
                    <Icon as={option.icon} size={20} />
                  ) : (
                    <Icon as={Ellipsis} size={20} className="text-foreground" />
                  )}
                </View>

                <View className="flex-1">
                  <Text variant={"large"}>{option.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          {customContent && customContentPosition === "bottom" && (
            <View className="mt-4">{customContent}</View>
          )}
        </ActionSheet>
      </>
    );
  },
);

ThreeDotsActionSheet.displayName = "ThreeDotsActionSheet";
