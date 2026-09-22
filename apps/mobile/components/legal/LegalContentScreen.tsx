import {
  AppHeaderBack,
  ApplicationHeader,
  HtmlDocument,
  StableScrollView,
  StableSafeAreaView,
} from "@instanct/mobile-components";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";
import { api } from "@/api";
import { useTranslation } from "react-i18next";

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

  const title = data?.title ?? fallbackTitle;
  const showNotice =
    Boolean(data?.hasNotApplied) || (data?.unresolvedKeys?.length ?? 0) > 0;

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
      <StableScrollView className="flex-1 bg-background">
        <View className="px-5 py-6">
          {isPending ? (
            <View className="items-center py-10">
              <ActivityIndicator />
            </View>
          ) : isError || !data ? (
            <Text className="text-sm leading-6 text-muted-foreground">
              This document is temporarily unavailable. Please try again later.
            </Text>
          ) : (
            <View className="gap-4">
              {data.subtitle ? (
                <Text className="text-sm leading-6 text-muted-foreground">
                  {data.subtitle}
                </Text>
              ) : null}
              {showNotice ? (
                <View className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                  <Text className="text-sm leading-6 text-amber-950 dark:text-amber-100">
                    Highlighted passages are not currently applied or still need
                    confirmation.
                  </Text>
                </View>
              ) : null}
              <HtmlDocument html={data.body} />
            </View>
          )}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
}
