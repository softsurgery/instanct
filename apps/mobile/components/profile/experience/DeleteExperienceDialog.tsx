import { Button } from "@instanct/mobile-ui";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@instanct/mobile-ui";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { UserStore } from "@/stores/useUserStore";
import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface DeleteExperienceDialogProps {
  userStore?: UserStore;
  trigger?: React.ReactNode;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  handleDelete?: () => void;
}

export const DeleteExperienceDialog = ({
  trigger,
  loading,
  handleDelete,
}: DeleteExperienceDialogProps) => {
  const { t } = useTranslation("menu");
  const [visible, setVisible] = React.useState(false);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogTrigger asChild>
        {trigger || (
          <Text className="text-red-500 text-sm font-semibold">
            {t("experience.delete.trigger")}
          </Text>
        )}
      </DialogTrigger>

      <DialogContent className={cn("w-[90vw] rounded-lg")}>
        <DialogTitle>
          <Text className="text-lg font-semibold text-foreground">
            {t("experience.delete.title")}
          </Text>
        </DialogTitle>

        <View className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">
            {t("experience.delete.message")}
          </Text>
        </View>

        <View className="flex flex-row gap-3 justify-end">
          <Button
            variant="destructive"
            onPress={() => {
              handleDelete?.();
              setVisible(false);
            }}
            disabled={loading}
            className="flex-1"
          >
            <Text>
              {loading
                ? t("experience.delete.actions.deletePending")
                : t("experience.delete.actions.delete")}
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={() => setVisible(false)}
            disabled={loading}
            className="flex-1"
          >
            <Text>{t("experience.delete.actions.cancel")}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
