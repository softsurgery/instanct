import React, { useRef } from "react";
import { ActionSheetRef } from "react-native-actions-sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  PhotoPreview,
  PhotoPreviewRef,
  ThreeDotsActionSheet,
} from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import {
  type UploadFileInput,
  type UploadProgressCallback,
} from "@softsurgery/mobile-form-builder";
import { type ReactNativeUploadFile } from "@/lib/upload";
import { cn } from "@softsurgery/lib";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Eye, Pencil, Trash2 } from "lucide-react-native";
import { Keyboard, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

interface UpdateProfileAvatarProps {
  wrapperClassName?: string;
  className?: string;
  editable?: boolean;
  image?: string | UploadFileInput | null;
  fallback?: string;
  progress?: number;
  onPickStart?: () => void;
  onPickEnd?: () => void;
  onFileChange?: (image: UploadFileInput) => void;
  onUpload?: (
    file: UploadFileInput,
    onProgress?: UploadProgressCallback,
  ) => void;
  onRemove?: () => void;
}

const resolveImageUri = (
  image?: string | UploadFileInput | null,
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if ("uri" in image && typeof image.uri === "string") return image.uri;
  return undefined;
};

const clampProgress = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

export const UpdateProfileAvatar = ({
  wrapperClassName,
  className,
  editable = true,
  image,
  fallback = "?",
  progress,
  onPickStart,
  onPickEnd,
  onFileChange,
  onUpload,
  onRemove,
}: UpdateProfileAvatarProps) => {
  const { t } = useTranslation("settings");
  const sheetRef = useRef<ActionSheetRef>(null);
  const previewRef = useRef<PhotoPreviewRef>(null);
  const [internalProgress, setInternalProgress] = React.useState<number>(0);

  const imageUri = resolveImageUri(image);
  const currentProgress =
    typeof progress === "number" ? clampProgress(progress) : internalProgress;
  const showProgress = currentProgress > 0 && currentProgress < 100;

  const handlePickPicture = async () => {
    onPickStart?.();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType =
          asset.mimeType ||
          (asset.type === "image" ? "image/jpeg" : asset.type) ||
          "image/jpeg";
        const fileName =
          asset.fileName || asset.uri.split("/").pop() || "photo.jpg";

        const fileLike: ReactNativeUploadFile = {
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        };

        onFileChange?.(fileLike);
        if (onUpload) {
          setInternalProgress(0);
          onUpload(fileLike, (percent: number) => {
            setInternalProgress(clampProgress(percent));
          });
        }
      }
    } catch (err) {
      console.error("ImagePicker error:", err);
    } finally {
      onPickEnd?.();
    }
  };

  const handlePress = () => {
    if (!editable) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.show();
  };

  return (
    <>
      <View className={cn("items-center justify-center", wrapperClassName)}>
        <Pressable
          className={cn(
            "relative items-center justify-center rounded-full active:opacity-80",
            !editable && "opacity-70",
          )}
          disabled={!editable}
          onPress={handlePress}
        >
          <Avatar
            alt={fallback}
            className={cn("h-40 w-40 rounded-full", className)}
          >
            <AvatarImage source={{ uri: imageUri }} />
            <AvatarFallback>
              <Text>{fallback}</Text>
            </AvatarFallback>
          </Avatar>
          {showProgress && (
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
              <Text className="text-xs font-semibold text-white">
                {`${currentProgress}%`}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <PhotoPreview
        ref={previewRef}
        source={imageUri ? { uri: imageUri } : undefined}
      />

      <ThreeDotsActionSheet
        ref={sheetRef}
        renderTrigger={false}
        options={[
          {
            label: t("settings.account.screens.profile.actions.view-picture"),
            icon: Eye,
            disabled: !imageUri,
            onPress: () => {
              setTimeout(() => {
                previewRef.current?.open();
              }, 300);
            },
          },
          {
            label: t("settings.account.screens.profile.actions.edit-picture"),
            icon: Pencil,
            disabled: !editable,
            onPress: () => {
              setTimeout(() => {
                handlePickPicture();
              }, 300);
            },
          },
          {
            label: t("settings.account.screens.profile.actions.remove-picture"),
            icon: Trash2,
            destructive: true,
            disabled: !imageUri || !editable,
            onPress: () => {
              onRemove?.();
            },
          },
        ]}
      />
    </>
  );
};
