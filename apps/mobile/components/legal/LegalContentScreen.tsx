import {
  AppHeaderBack,
  ApplicationHeader,
  HtmlDocument,
  StableSafeAreaView,
  useColorPalette,
  Loader,
} from "@instanct/mobile-components";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { api } from "@/api";
import { useTranslation } from "react-i18next";
import React from "react";

type LegalContentScreenProps = {
  slug: "terms" | "privacy";
  fallbackTitle: string;
  className?: string;
};

export function LegalContentScreen({
  slug,
  fallbackTitle,
  className,
}: LegalContentScreenProps) {
  const { i18n } = useTranslation();
  const { data, isPending, isError } = useQuery({
    queryKey: ["content-page", slug, i18n.language],
    queryFn: () => api.contentPage.findBySlug(slug, i18n.language),
  });
  const { palette } = useColorPalette();
  const [isHtmlLoading, setIsHtmlLoading] = React.useState(true);

  const title = data?.title ?? fallbackTitle;

  if (isPending) {
    return <Loader className="flex-1 items-center justify-center" />;
  }

  if (isError || !data)
    return (
      <Text className="text-sm leading-6 text-des">
        This document is temporarily unavailable. Please try again later.
      </Text>
    );

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
        <View className="flex-1 relative">
          {isHtmlLoading && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-background">
              <Loader />
            </View>
          )}
          <HtmlDocument
            html={data.body}
            paletteStr={JSON.stringify(palette)}
            onReady={async () => setIsHtmlLoading(false)}
            htmlStyles={{ paddingBlock: 16 }}
            dom={{
              style: {
                flex: 1,
                backgroundColor: "transparent",
              },
              showsVerticalScrollIndicator: false,
              showsHorizontalScrollIndicator: false,
            }}
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
}
