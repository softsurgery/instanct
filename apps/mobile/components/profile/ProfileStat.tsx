import { cn } from "@instanct/lib";
import { Pressable, View } from "react-native";
import { Pencil } from "lucide-react-native";
import { Icon } from "@instanct/mobile-ui";
import { Text } from "@instanct/mobile-ui";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

interface ProfileStatProps {
  className?: string;
}

export const ProfileStat = ({ className }: ProfileStatProps) => {
  const { t } = useTranslation("menu");
  return (
    <View className={cn(className)}>
      <Pressable
        onPress={() => router.push("/main/profile/update-profile")}
        className="flex-row items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 active:opacity-80"
      >
        <Icon as={Pencil} size={16} />
        <Text className="text-md font-semibold">
          {t("menu.actions.editProfile")}
        </Text>
      </Pressable>
    </View>
  );
};
