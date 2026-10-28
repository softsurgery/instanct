import { LottieEmailVerified } from "@softsurgery/mobile-components";
import { View, Pressable } from "react-native";
import { Text } from "@softsurgery/mobile-ui";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";

export const EmailChangedSuccess = () => {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const router = useRouter();
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, [queryClient]);
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <LottieEmailVerified
        message={t(
          "emailVerification.success",
          "Your email has been verified successfully",
        )}
        size={300}
        className="flex flex-col justify-center items-center"
        textProps={{
          className: "text-center text-lg font-bold",
        }}
      />
      <Pressable
        className="active:opacity-70"
        onPress={() => router.replace("/main/(tabs)")}
      >
        <Text className="text-primary text-center">
          {t("emailVerification.backToMenu", "Go back to explore menu")}
        </Text>
      </Pressable>
    </View>
  );
};
