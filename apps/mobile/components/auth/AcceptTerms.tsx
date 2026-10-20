import { cn } from "@softsurgery/lib";
import { router } from "expo-router";
import { View } from "react-native";
import { Checkbox } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { useTranslation } from "react-i18next";

interface AcceptTermsProps {
  className?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export const AcceptTerms = ({
  className,
  checked,
  onCheckedChange,
  disabled,
  error,
  required = true,
}: AcceptTermsProps) => {
  const { t } = useTranslation("explore");
  return (
    <View className={cn("flex flex-col gap-1.5", className)}>
      <View className="flex flex-row items-center gap-2.5">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        <Text className="flex-1 text-sm text-muted-foreground">
          {t("onBoarding.terms.iAccept")}{" "}
          <Text
            className="text-sm text-foreground underline"
            onPress={() => router.push("/auth/legal?type=terms")}
          >
            {t("onBoarding.terms.termsOfUse")}
          </Text>{" "}
          {t("onBoarding.terms.and")}{" "}
          <Text
            className="text-sm text-foreground underline"
            onPress={() => router.push("/auth/legal?type=privacy")}
          >
            {t("onBoarding.terms.privacyPolicy")}
          </Text>
          .
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      </View>
      {error ? (
        <Text className="text-sm font-medium text-destructive px-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
