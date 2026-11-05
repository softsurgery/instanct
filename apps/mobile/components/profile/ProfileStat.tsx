import { cn } from "@softsurgery/lib";
import { Pressable, View } from "react-native";
import { Mail, Pencil } from "lucide-react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ResponseUserDto } from "api-client";
import { useColorPalette } from "@softsurgery/mobile-hooks";

interface ProfileStatProps {
  className?: string;
  emailVerification: {
    currentUser: ResponseUserDto | null;
    user: ResponseUserDto | null;
    id: string;
    sendVerifyEmail: () => void;
    isSendVerifyEmailPending: boolean;
  };
}

export const ProfileStat = ({
  className,
  emailVerification,
}: ProfileStatProps) => {
  const { palette } = useColorPalette();
  const { currentUser, user, id, sendVerifyEmail, isSendVerifyEmailPending } =
    emailVerification;
  const { t } = useTranslation("menu");
  return (
    <View className={cn("flex flex-col gap-2", className)}>
      {currentUser?.id === id && user?.email && !user.emailVerified ? (
        <Pressable
          onPress={() => sendVerifyEmail()}
          disabled={isSendVerifyEmailPending}
          className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2 active:opacity-80 bg-yellow-700"
        >
          <Icon as={Mail} size={16} color={palette.primaryForeground} />
          <Text className="text-md font-semibold text-primary-foreground">
            {t("menu.actions.verifyEmail")}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push("/main/profile/update-profile")}
          className="flex-row items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 active:opacity-80"
        >
          <Icon as={Pencil} size={16} />
          <Text className="text-md font-semibold">
            {t("menu.actions.editProfile")}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
