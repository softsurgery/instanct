import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { View } from "react-native";
import { Text, Button } from "@softsurgery/mobile-ui";
import { useColorPalette } from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import { RequestEvent } from "api-client";

interface RequestConfirmActionSheetProps {
  event: RequestEvent | null;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
  isCancelMeeting?: boolean;
}

export const RequestConfirmActionSheet = React.forwardRef<
  ActionSheetRef,
  RequestConfirmActionSheetProps
>(({ event, onConfirm, onClose, isPending, isCancelMeeting }, ref) => {
  const { t } = useTranslation("activities");
  const { palette } = useColorPalette();

  const isAccept = event === RequestEvent.Accept;
  const scope = isAccept ? "accept" : "reject";

  const title = isCancelMeeting
    ? t("activities.request.actionSheet.cancelMeeting.title")
    : t(`activities.incomming.request.actionSheet.${scope}.title`);

  const message = isCancelMeeting
    ? t("activities.request.actionSheet.cancelMeeting.message")
    : t(`activities.incomming.request.actionSheet.${scope}.message`);

  const confirmText = isCancelMeeting
    ? t("activities.request.actionSheet.cancelMeeting.confirm")
    : t(`activities.incomming.request.actionSheet.${scope}.confirm`);

  const cancelText = isCancelMeeting
    ? t("activities.request.actionSheet.cancelMeeting.cancel")
    : t(`activities.incomming.request.actionSheet.${scope}.cancel`);

  return (
    <ActionSheet
      ref={ref}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      containerStyle={{
        backgroundColor: palette.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View>
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Text variant="large" className="text-foreground">
                {title}
              </Text>
            </View>
          </View>

          <Text className="mb-4 text-sm text-muted-foreground">
            {message}
          </Text>

          <View className="pt-4">
            <View className="flex flex-col justify-between gap-2">
              <Button
                size="lg"
                variant={
                  isCancelMeeting || !isAccept ? "destructive" : "default"
                }
                className="rounded-xl"
                onPress={onConfirm}
                disabled={isPending}
              >
                <Text className="text-md font-bold">
                  {confirmText}
                </Text>
              </Button>
              <Button
                size="lg"
                className="rounded-xl"
                variant="outline"
                onPress={onClose}
                disabled={isPending}
              >
                <Text className="text-md font-bold">
                  {cancelText}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

RequestConfirmActionSheet.displayName = "RequestConfirmActionSheet";
