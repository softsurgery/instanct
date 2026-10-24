import React, { useRef, useMemo } from "react";
import { ActionSheetRef } from "react-native-actions-sheet";
import {
  ThreeDotsActionSheet,
  PhotoPreview,
  PhotoPreviewRef,
} from "@softsurgery/mobile-components";
import * as Haptics from "expo-haptics";
import { Keyboard, Pressable } from "react-native";
import { Eye, Camera } from "lucide-react-native";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { type ReactNativeUploadFile } from "@/lib/upload";
import { useApi } from "@/contexts/ApiContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import {
  ResponseUserDto,
  Upload,
  UpdateUserDto,
  ServerErrorResponse,
} from "@softsurgery/api-client";
import { useLoader } from "@/contexts/LoaderContext";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";

interface ProfileAvatarProps {
  user: ResponseUserDto;
  currentUser: ResponseUserDto | null;
  onRefresh: () => void;
}

export const ProfileAvatar = ({
  user,
  currentUser,
  onRefresh,
}: ProfileAvatarProps) => {
  const api = useApi();
  const { t } = useTranslation("menu");
  const queryClient = useQueryClient();
  const [isPickingPicture, setIsPickingPicture] = React.useState(false);
  const { setLoading } = useLoader();

  const sheetRef = useRef<ActionSheetRef>(null);
  const previewRef = useRef<PhotoPreviewRef>(null);

  const isCurrentUser = currentUser?.id === user?.id;

  const fallback = useMemo(() => identifyUserAvatar(user), [user]);

  const { uploads: profilePictureUploads, jsxArray: profilePictures } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      className: "rounded-full",
      wrapperClassName: "border border-border bg-background rounded-full",
      size: { width: 100, height: 100 },
    });
  const profilePictureSource = profilePictureUploads?.[0];

  const { uploadFiles: uploadProfilePicture, isUploadPending } =
    useUploadMutation({
      onSuccess: (response: Upload[]) => {
        const pictureId = response?.[0]?.id;
        if (pictureId) {
          updateProfilePicture({ pictureId });
        }
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message || t("menu.toasts.uploadError"),
          {},
        );
      },
    });

  const { mutate: updateProfilePicture, isPending: isUpdatePending } =
    useMutation({
      mutationFn: (updateDto: UpdateUserDto) =>
        api.currentUser.update(updateDto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        if (currentUser?.pictureId) {
          queryClient.invalidateQueries({
            queryKey: ["server-image", currentUser.pictureId],
          });
        }
        onRefresh();
        toast.success(t("menu.toasts.profilePictureUpdated"), {
          description: t("menu.toasts.profilePictureUpdatedDescription"),
        });
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message || t("menu.toasts.profilePictureError"),
          {},
        );
      },
    });

  React.useEffect(() => {
    setLoading(isUploadPending || isUpdatePending || isPickingPicture);
  }, [isUploadPending, isUpdatePending, isPickingPicture, setLoading]);

  React.useEffect(() => {
    return () => setLoading(false);
  }, [setLoading]);

  const handlePickPicture = async () => {
    setIsPickingPicture(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileLike: ReactNativeUploadFile = {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop() || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      };

      uploadProfilePicture({
        files: [fileLike],
      });
    } finally {
      setIsPickingPicture(false);
    }
  };

  const handlePress = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isCurrentUser) {
      sheetRef.current?.show();
    } else if (profilePictureSource) {
      previewRef.current?.open();
    }
  };

  return (
    <>
      <Pressable className="active:opacity-85" onPress={handlePress}>
        {profilePictures[0]}
      </Pressable>

      <PhotoPreview ref={previewRef} source={profilePictureSource} />

      <ThreeDotsActionSheet
        ref={sheetRef}
        renderTrigger={false}
        options={[
          {
            label: t("menu.actions.viewPhoto"),
            icon: Eye,
            disabled: !profilePictureSource,
            onPress: () => {
              setTimeout(() => {
                previewRef.current?.open();
              }, 300);
            },
          },
          {
            label: t("menu.actions.updatePhoto"),
            icon: Camera,
            onPress: () => {
              setTimeout(() => {
                handlePickPicture();
              }, 300);
            },
          },
        ]}
      />
    </>
  );
};
