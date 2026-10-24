import React from "react";
import {
  View,
  Linking,
  BackHandler,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Icon, Text } from "@softsurgery/mobile-ui";
import { Download, AlertCircle, RefreshCw } from "lucide-react-native";
import { useAppVersionCheck } from "@/hooks/useAppVersionCheck";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ForceUpdateGate = () => {
  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const {
    hasConfirmedMandatoryUpdate,
    installedVersion,
    requiredMinVersion,
    storeUrl,
    refetchPolicy,
  } = useAppVersionCheck();

  const [isRetrying, setIsRetrying] = React.useState(false);
  const [openUrlError, setOpenUrlError] = React.useState<string | null>(null);

  const isStoreConfigured = React.useMemo(() => {
    if (!storeUrl || typeof storeUrl !== "string" || !storeUrl.trim()) {
      return false;
    }
    const trimmed = storeUrl.trim();
    return (
      /^https:\/\//i.test(trimmed) ||
      /^market:\/\//i.test(trimmed) ||
      /^itms-apps:\/\//i.test(trimmed)
    );
  }, [storeUrl]);

  // Prevent hardware back navigation on Android while mandatory update is active
  React.useEffect(() => {
    if (!hasConfirmedMandatoryUpdate) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, [hasConfirmedMandatoryUpdate]);

  if (!hasConfirmedMandatoryUpdate) {
    return null;
  }

  const handleOpenStore = async () => {
    setOpenUrlError(null);

    if (!storeUrl || typeof storeUrl !== "string" || !storeUrl.trim()) {
      setOpenUrlError(
        t(
          "settings.updateGate.urlNotConfigured",
          "The update link for your platform is not available yet. Please check back shortly or contact support.",
        ),
      );
      return;
    }

    const trimmed = storeUrl.trim();
    const isSafeScheme =
      /^https:\/\//i.test(trimmed) ||
      /^market:\/\//i.test(trimmed) ||
      /^itms-apps:\/\//i.test(trimmed);

    if (!isSafeScheme) {
      setOpenUrlError(
        t(
          "settings.updateGate.urlNotConfigured",
          "The update link for your platform is not available yet. Please check back shortly or contact support.",
        ),
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(trimmed);
      if (supported) {
        await Linking.openURL(trimmed);
      } else {
        // Fallback for Android market links if market:// is not supported on some custom ROMs
        if (/^market:\/\/details\?id=(.+)/i.test(trimmed)) {
          const appId = trimmed.replace(/^market:\/\/details\?id=/i, "");
          const webUrl = `https://play.google.com/store/apps/details?id=${appId}`;
          await Linking.openURL(webUrl);
        } else {
          setOpenUrlError(
            t(
              "settings.updateGate.urlNotConfigured",
              "Unable to open the store on this device. Please update Instanct manually from your app store.",
            ),
          );
        }
      }
    } catch {
      setOpenUrlError(
        t(
          "settings.updateGate.urlNotConfigured",
          "Failed to open store link. Please try again or visit your app store.",
        ),
      );
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setOpenUrlError(null);
    try {
      await refetchPolicy();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          zIndex: 999999,
          elevation: 999999,
        },
      ]}
      className="flex flex-col justify-between items-center bg-background px-6"
    >
      <View className="flex-1 justify-center items-center max-w-sm w-full">
        {/* Hero Icon */}
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
          <Icon as={Download} size={40} className="text-primary" />
        </View>

        {/* Title & Description */}
        <Text variant="h2" className="text-center font-bold mb-3">
          {t("settings.updateGate.title", "Update Required")}
        </Text>

        <Text
          variant="muted"
          className="text-center text-sm leading-relaxed mb-6"
        >
          {t(
            "settings.updateGate.description",
            "A newer version of Instanct is required to continue. Please update to the latest version to access the app.",
          )}
        </Text>

        {/* Version Badges */}
        <View className="flex flex-row items-center gap-2 bg-muted/60 py-2 px-4 rounded-full mb-6">
          <Text className="text-xs font-mono text-muted-foreground">
            {t("settings.updateGate.installedVersion", {
              version: installedVersion,
              defaultValue: `Installed: v${installedVersion}`,
            })}
          </Text>
          {requiredMinVersion ? (
            <>
              <Text className="text-xs text-muted-foreground">•</Text>
              <Text className="text-xs font-mono font-semibold text-primary">
                {t("settings.updateGate.requiredVersion", {
                  version: requiredMinVersion,
                  defaultValue: `Required: v${requiredMinVersion}`,
                })}
              </Text>
            </>
          ) : null}
        </View>

        {/* Notice if store URL is not configured yet */}
        {!isStoreConfigured ? (
          <View className="flex flex-row items-start gap-2 bg-muted/80 p-3 rounded-lg border border-border mb-4 w-full">
            <Icon
              as={AlertCircle}
              size={18}
              className="text-muted-foreground mt-0.5 shrink-0"
            />
            <Text className="text-xs text-muted-foreground flex-1 leading-snug">
              {t(
                "settings.updateGate.urlNotConfigured",
                "The update link for your platform is not available yet. Please check back shortly or contact support.",
              )}
            </Text>
          </View>
        ) : null}

        {/* Error notification if store URL fails to open at runtime */}
        {openUrlError ? (
          <View className="flex flex-row items-start gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20 mb-4 w-full">
            <Icon
              as={AlertCircle}
              size={18}
              className="text-destructive mt-0.5 shrink-0"
            />
            <Text className="text-xs text-destructive flex-1 leading-snug">
              {openUrlError}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-sm flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full flex flex-row items-center justify-center gap-2 rounded-xl"
          onPress={handleOpenStore}
          disabled={!isStoreConfigured}
        >
          <Icon as={Download} size={18} color="white" />
          <Text className="text-md font-bold text-primary-foreground">
            {isStoreConfigured
              ? t("settings.updateGate.updateButton", "Update Now")
              : t(
                  "settings.updateGate.linkUnavailable",
                  "Update Link Unavailable",
                )}
          </Text>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full flex flex-row items-center justify-center gap-2 rounded-xl"
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" />
          ) : (
            <Icon as={RefreshCw} size={16} />
          )}
          <Text className="text-md font-semibold">
            {isRetrying
              ? t("settings.updateGate.checking", "Checking version...")
              : t("settings.updateGate.retryButton", "Check Again")}
          </Text>
        </Button>
      </View>
    </View>
  );
};
