import {
  AppHeaderBack,
  ApplicationHeader,
  HtmlDocument,
  StableSafeAreaView,
  Loader,
} from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { useQuery } from "@tanstack/react-query";
import { useLayoutConfig } from "@/config/wrapper-config";
import { View } from "react-native";
import { useApi } from "api-client/hooks";
import { useTranslation } from "react-i18next";
import React from "react";
import { useColorPalette } from "@softsurgery/mobile-hooks";

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
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
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
      <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
        <ApplicationHeader
          classNames={{
            wrapper: applicationHeaderClassNames.wrapper,
          }}
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
        <View className="flex-1 items-center justify-center bg-background rounded-b-xl">
          <Loader />
        </View>
      </StableSafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
        <ApplicationHeader
          classNames={{
            wrapper: applicationHeaderClassNames.wrapper,
          }}
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
        <View className="flex-1 items-center justify-center bg-background px-6 rounded-b-xl">
          <Text className="text-sm leading-6 text-muted-foreground text-center">
            This document is temporarily unavailable. Please try again later.
          </Text>
        </View>
      </StableSafeAreaView>
    );
  }

  return (
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
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
      <View className="flex-1 bg-background px-4 rounded-b-xl">
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
