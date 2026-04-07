import React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { toast } from "sonner";
import { api } from "@/api";
import { useUserStore } from "@/hooks/stores/useUserStore";

export const useCoverPhoto = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const userStore = useUserStore();

  const { uploadFiles: uploadCover, isUploadPending: isCoverUploadPending } =
    useUploadMutation({
      onSuccess: (response) => {
        if (response && response[0]) {
          updateCoverMutation.mutate(response[0].id);
        }
      },
      onError: () => {
        toast.error("Failed to upload cover photo");
      },
    });

  const updateCoverMutation = useMutation({
    mutationFn: (coverId: number) => {
      return api.admin.user.updateCover(userId || "", coverId);
    },
    onSuccess: (data) => {
      userStore.set("response", data);
      queryClient.invalidateQueries({ queryKey: ["cover-picture"] });
      toast.success("Cover photo updated successfully");
    },
    onError: () => {
      toast.error("Failed to update cover photo");
    },
  });

  const handleCoverEdit = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadCover({ files: [file] });
    }
  };

  return {
    fileInputRef,
    isCoverUploadPending,
    isCoverUpdatePending: updateCoverMutation.isPending,
    handleCoverEdit,
    handleFileChange,
  };
};
