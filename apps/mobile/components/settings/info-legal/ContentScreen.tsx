import {
  AppHeaderBack,
  ApplicationHeader,
  HtmlDocument,
  StableSafeAreaView,
  useColorPalette,
  Loader,
} from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { useApi } from "@/contexts/ApiContext";
import { useTranslation } from "react-i18next";
import React from "react";

type ContentScreenProps = {
  slug: "terms" | "privacy" | "about" | "faqs" | "support";
  fallbackTitle: string;
  className?: string;
  /**
   * Open links in the device browser instead of navigating inside this screen's WebView.
   */
  openLinksExternally?: boolean;
};

export function ContentScreen({
  slug,
  fallbackTitle,
  className,
  openLinksExternally = true,
}: ContentScreenProps) {
  const api = useApi();
  const { i18n } = useTranslation();
  const { data, isPending, isError } = useQuery({
    queryKey: ["content-page", slug, i18n.language],
    queryFn: () => api.contentPage.findBySlug(slug, i18n.language),
  });
  const { palette } = useColorPalette();
  const paletteStr = React.useMemo(
    () => (palette ? JSON.stringify(palette) : undefined),
    [palette],
  );

  const [isHtmlLoading, setIsHtmlLoading] = React.useState(true);

  const handleReady = React.useCallback(() => {
    setIsHtmlLoading(false);
  }, []);

  const htmlStyles = React.useMemo(() => ({ paddingBlock: 16 }), []);

  const domProps = React.useMemo<import("expo/dom").DOMProps>(
    () => ({
      style: {
        flex: 1,
        backgroundColor: "transparent",
      },
      showsVerticalScrollIndicator: false,
      showsHorizontalScrollIndicator: false,
    }),
    [],
  );

  const title = data?.title ?? fallbackTitle;

  if (isPending) {
    return (
      <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
        <ApplicationHeader
          classNames={{ wrapper: "border-b border-border pb-2" }}
          title={fallbackTitle}
          titleVariant="large"
          reverse
          shortcuts={[
            {
              key: "back",
              render: <AppHeaderBack />,
            },
          ]}
        />
        <View className="flex-1 items-center justify-center bg-background">
          <Loader />
        </View>
      </StableSafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
        <ApplicationHeader
          classNames={{ wrapper: "border-b border-border pb-2" }}
          title={fallbackTitle}
          titleVariant="large"
          reverse
          shortcuts={[
            {
              key: "back",
              render: <AppHeaderBack />,
            },
          ]}
        />
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-sm leading-6 text-muted-foreground text-center">
            This document is temporarily unavailable. Please try again later.
          </Text>
        </View>
      </StableSafeAreaView>
    );
  }

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={title}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background px-4">
        <View key={`${slug}-${i18n.language}`} className="flex-1 relative">
          {isHtmlLoading && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-background">
              <Loader />
            </View>
          )}
          <HtmlDocument
            html={data.body}
            paletteStr={paletteStr}
            htmlStyles={htmlStyles}
            dom={domProps}
            enableBridgeInjection
            onReady={handleReady}
            scrollEnabled
            bounces={true}
            openLinksExternally={openLinksExternally}
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
}

export { ContentScreen as LegalContentScreen };
