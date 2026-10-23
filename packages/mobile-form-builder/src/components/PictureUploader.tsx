import React from "react";
import { Button } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import * as ImagePicker from "expo-image-picker";
import { Pressable, View } from "react-native";
import { cn } from "@softsurgery/lib";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@softsurgery/mobile-components";
import type {
  MobileUploadFile,
  UploadFileInput,
  UploadProgressCallback,
} from "../types";

export interface PictureUploaderProps {
  wrapperClassName?: string;
  className?: string;
  editable?: boolean;
  image?: string | UploadFileInput | null;
  fallback?: string;
  onPickStart?: () => void;
  onPickEnd?: () => void;
  onFileChange?: (image: UploadFileInput) => void;
  onUpload?: (
    file: UploadFileInput,
    onProgress?: UploadProgressCallback,
  ) => void;
  progress?: number;
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

export const PictureUploader = ({
  wrapperClassName,
  className,
  editable = true,
  image,
  fallback = "?",
  onPickStart,
  onPickEnd,
  onFileChange,
  onUpload,
  progress,
}: PictureUploaderProps) => {
  const [internalProgress, setInternalProgress] = React.useState<number>(0);

  const onPress = async () => {
    onPickStart?.();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      onPickEnd?.();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const mimeType =
          asset.mimeType ||
          (asset.type === "image" ? "image/jpeg" : asset.type) ||
          "image/jpeg";
        const fileName =
          asset.fileName || asset.uri.split("/").pop() || "photo.jpg";

        const fileLike: MobileUploadFile = {
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
      onPickEnd?.();
      console.error("ImagePicker error:", err);
    }
  };

  const imageUri = resolveImageUri(image);
  const currentProgress =
    typeof progress === "number" ? clampProgress(progress) : internalProgress;
  const showProgress = currentProgress > 0 && currentProgress < 100;

  return (
    <Pressable
      className={cn(wrapperClassName, !editable && "opacity-70")}
      disabled={!editable}
    >
      <Button
        variant="link"
        className={"relative h-fit w-fit p-0 rounded-full"}
        onPress={onPress}
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
      </Button>
    </Pressable>
  );
};
