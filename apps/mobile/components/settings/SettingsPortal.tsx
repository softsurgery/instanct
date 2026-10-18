import React from "react";
import { cn } from "@softsurgery/lib";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { identifyUser } from "@/lib/user";
import { router } from "expo-router";
import { ChevronRight, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  AppHeaderBack,
  ApplicationHeader,
  StableSafeAreaView,
  StableScrollView,
} from "@softsurgery/mobile-components";
import { SettingRow, SettingRowProps } from "./SettingsRow";
import { useLogout } from "@/hooks/useLogout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { useApi } from "@/contexts/ApiContext";
import { getAppVersionInfo } from "@/lib/app-version";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { DeleteAccountActionSheet } from "./DeleteAccountActionSheet";
import type { ServerErrorResponse } from "@softsurgery/api-client";
import { Button, Icon, Separator, Text } from "@softsurgery/mobile-ui";

interface SettingsPortalProps {
  className?: string;
}

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowProps[];
  showOnDevelopment?: boolean;
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { t: tSettings } = useTranslation("settings");
  const { installedVersion } = React.useMemo(() => getAppVersionInfo(), []);

  const settingsSections: SettingsSection[] = [
    {
      key: "account",
      title: tSettings("settings.account.title"),
      description: tSettings("settings.account.description"),
      rows: [
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.account.screens.profile.title"),
          description: tSettings(
            "settings.account.screens.profile.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/profile/update-profile"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.account.screens.privacy-security.title"),
          description: tSettings(
            "settings.account.screens.privacy-security.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/profile/privacy-security"),
        },
      ],
      showOnDevelopment: false,
    },
    {
      key: "preferences",
      title: tSettings("settings.preferences.title"),
      description: tSettings("settings.preferences.description"),
      rows: [
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.preferences.screens.language.title"),
          description: tSettings(
            "settings.preferences.screens.language.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/language"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.preferences.screens.theme.title"),
          description: tSettings(
            "settings.preferences.screens.theme.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/theme"),
        },
      ],
      showOnDevelopment: false,
    },
    {
      key: "support",
      title: tSettings("settings.support.title"),
      description: tSettings("settings.support.description"),
      rows: [
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.support.screens.support.title"),
          description: tSettings(
            "settings.support.screens.support.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/support"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.support.screens.report-bug.title"),
          description: tSettings(
            "settings.support.screens.report-bug.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/report-bug"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.support.screens.send-feedback.title"),
          description: tSettings(
            "settings.support.screens.send-feedback.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/send-feedback"),
        },
      ],
      showOnDevelopment: false,
    },
    {
      key: "info",
      title: tSettings("settings.info-legal.title"),
      description: tSettings("settings.info-legal.description"),
      rows: [
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.support.screens.faqs.title"),
          description: tSettings("settings.support.screens.faqs.description"),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/faqs"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings(
            "settings.info-legal.screens.terms-of-service.title",
          ),
          description: tSettings(
            "settings.info-legal.screens.terms-of-service.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/terms"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.info-legal.screens.privacy-policy.title"),
          description: tSettings(
            "settings.info-legal.screens.privacy-policy.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/privacy-policy"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: tSettings("settings.info-legal.screens.about.title"),
          description: tSettings(
            "settings.info-legal.screens.about.description",
          ),
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/about"),
        },
      ],
      showOnDevelopment: false,
    },
    {
      key: "test",
      title: "Test",
      description: "This is just for development purposes",
      rows: [
        {
          className: "p-1 px-4 mt-1",
          title: "Deep link",
          description: "Test deep linking",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/test/deep-link-test"),
        },
        {
          className: "p-1 px-4 mt-1",
          title: "Invalidate Queries",
          description: "Invalidate all queries",
          rightIcon: ChevronRight,
          onPress: () => {
            queryClient.invalidateQueries();
            toast.success("Queries invalidated successfully", {
              description: "All queries have been invalidated",
            });
          },
        },
      ],
      showOnDevelopment: true,
    },
  ].filter((section) => !section.showOnDevelopment || __DEV__);

  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const logout = useLogout();

  const deleteAccountSheetRef = React.useRef<ActionSheetRef>(null);

  const { mutate: deleteAccount, isPending: isDeleteAccountPending } =
    useMutation({
      mutationFn: () => api.currentUser.remove(),
      onSuccess: () => {
        deleteAccountSheetRef.current?.hide();
        toast.success(tSettings("settings.session.deleteAlert.success"));
        logout();
      },
      onError: (error: ServerErrorResponse) => {
        deleteAccountSheetRef.current?.hide();
        toast.error(tSettings("settings.session.deleteAlert.error"), {
          description: error.response?.data?.message,
        });
      },
    });

  const handleDeleteAccount = () => {
    if (isDeleteAccountPending) return;

    deleteAccountSheetRef.current?.show();
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.settings.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableScrollView className="flex-1 bg-background">
        <View className="flex flex-col">
          <View className="px-4 mb-2">
            <View className="flex flex-col justify-between p-4">
              <View className="flex flex-row justify-between items-center w-full">
                <Text variant="h4">
                  {identifyUser(currentUser) || "Your account"}
                </Text>
              </View>

              <Text variant="muted">
                {tSettings("settings.general.description")}
              </Text>
            </View>
          </View>

          {settingsSections.map((section) => (
            <View key={section.key} className="bg-background">
              <View className="px-8 py-4 bg-card mb-4">
                <Text className="text-lg font-semibold">{section.title}</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col">
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;

                  return (
                    <View key={index} className="flex flex-col gap-2">
                      <SettingRow {...row} />
                      {!isLast && <Separator className="mb-2" />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          <View className="px-4 mt-4">
            <View className={cn("bg-card mb-10 rounded-xl")}>
              <View className="px-4 pt-4 pb-2">
                <Text className="text-lg font-semibold">
                  {tSettings("settings.session.title")}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {tSettings("settings.session.description")}
                </Text>
              </View>

              <View className="px-4 pb-4 mt-4 flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex flex-row items-center justify-center gap-2 rounded-xl"
                  onPress={logout}
                >
                  <Icon as={LogOut} size={18} />
                  <Text className="text-md font-bold">
                    {tSettings("settings.session.actions.sign-out")}
                  </Text>
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  className="flex flex-row items-center justify-center gap-2 rounded-xl"
                  onPress={handleDeleteAccount}
                  disabled={isDeleteAccountPending}
                >
                  <Icon as={Trash2} size={18} color="white" />
                  <Text className="text-md font-bold">
                    {tSettings("settings.session.actions.remove-account")}
                  </Text>
                </Button>

                <Text className="pt-1 text-center text-xs text-muted-foreground">
                  {tSettings("settings.session.version", {
                    version: installedVersion,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </StableScrollView>

      <DeleteAccountActionSheet
        ref={deleteAccountSheetRef}
        onConfirm={() => deleteAccount()}
        onClose={() => deleteAccountSheetRef.current?.hide()}
        isPending={isDeleteAccountPending}
      />
    </StableSafeAreaView>
  );
};
