import React from "react";
import { View } from "react-native";
import { Button, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { toast } from "sonner-native";
import { AuthStore, useAuthStore } from "@/stores/useAuthStore";

export interface UseSignupDebugButtonProps {
  store?: AuthStore;
}

export const useSignupDebugButton = ({
  store,
}: UseSignupDebugButtonProps = {}) => {
  const defaultStore = useAuthStore();
  const authStore = store ?? defaultStore;

  const fillRandomValues = React.useCallback(() => {
    const randomFirstNames = [
      "Alex",
      "Jordan",
      "Taylor",
      "Morgan",
      "Sam",
      "Casey",
      "Riley",
      "Jamie",
    ];
    const randomLastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Miller",
      "Davis",
    ];
    const rand = Math.random().toString(36).substring(2, 7);
    const time = Date.now().toString().slice(-4);

    const firstName =
      randomFirstNames[Math.floor(Math.random() * randomFirstNames.length)];
    const lastName =
      randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    const email = `test_${time}_${rand}@example.com`;
    const username = `user_${rand}`;
    const password = "Password123!";

    authStore.set("signUpRequest", {
      ...authStore.signUpRequest,
      firstName,
      lastName,
      email,
      username,
      password,
    });

    authStore.set("utilities", {
      ...authStore.utilities,
      confirmPassword: password,
      acceptedTerms: true,
    });

    authStore.set("signUpRequestErrors", {});
    toast.success("Random values inserted");
  }, [authStore]);

  const DebugButton = React.useCallback(
    ({ className }: { className?: string } = {}) => {
      if (!__DEV__) return null;

      return (
        <View className={cn("flex-row justify-end px-2 pb-3", className)}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 border-dashed border-primary/50 bg-primary/5 active:bg-primary/10 flex-row items-center gap-1.5 rounded-lg"
            onPress={fillRandomValues}
          >
            <Text className="text-xs font-semibold text-primary">Debug</Text>
          </Button>
        </View>
      );
    },
    [fillRandomValues],
  );

  return {
    fillRandomValues,
    DebugButton,
  };
};
