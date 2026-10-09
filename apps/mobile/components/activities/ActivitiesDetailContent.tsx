import React from "react";
import type { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { View, useWindowDimensions } from "react-native";
import { SessionIncomingRequests } from "./SessionIncomingRequests";
import { SessionOutgoingRequests } from "./SessionOutgoingRequests";
import { Text } from "@instanct/mobile-ui";
import { useInfiniteUserBookmarks } from "@/hooks/content/users/useInfinteUserBookmarks";
import { LegendList } from "@legendapp/list";
import { BookmarkCard } from "./BookmarkCard";
import { ResponseUserBookmarkDto } from "@/types/bookmark";
import { ResponseUserDto } from "@/types";
import { Loader, hslToHex, useColorPalette } from "@instanct/mobile-components";
import { cn } from "@instanct/lib";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { NotFound } from "@instanct/mobile-components";
import { BookmarkSkeleton } from "./skeletons/BookmarkSkeleton";
import { TabView, TabBar } from "react-native-tab-view";
import { useTranslation } from "react-i18next";

interface ActivitiesDetailContentProps {
  className?: string;
  session?: ResponseSessionDto<MapSessionPayload> | null;
  handleScroll?: (event: any) => void;
}

type FlattenedBookmark =
  | { type: "header"; title: string; id: string }
  | { type: "item"; bookmark: ResponseUserBookmarkDto; id: string };

export const ActivitiesDetailContent = ({
  className,
  session,
  handleScroll,
}: ActivitiesDetailContentProps) => {
  const { t } = useTranslation("activities");
  const {
    bookmarks,
    fetchNextPage,
    hasNextPage,
    isBookmarksPending,
    isFetchingNextPage,
    isRefetching,
    refetchBookmarks,
  } = useInfiniteUserBookmarks({
    join: ["bookmark"],
  });

  const [removedUserIds, setRemovedUserIds] = React.useState<Set<string>>(
    new Set(),
  );

  const handleRemoved = React.useCallback((user?: ResponseUserDto) => {
    if (!user?.id) return;
    setRemovedUserIds((prev) => new Set(prev).add(user.id));
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: FlattenedBookmark }) => {
      if (item.type === "header") {
        return (
          <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {item.title}
          </Text>
        );
      }

      return (
        <BookmarkCard user={item.bookmark.bookmark} onRemoved={handleRemoved} />
      );
    },
    [handleRemoved],
  );

  const flattenedData = React.useMemo<FlattenedBookmark[]>(() => {
    const grouped: Record<string, ResponseUserBookmarkDto[]> = {};

    bookmarks
      .filter((b) => !removedUserIds.has(b.bookmark?.id as string))
      .forEach((bookmark) => {
        const date = parseISO(new Date(bookmark.createdAt).toISOString());

        let title = format(date, "MMMM d, yyyy");

        if (isToday(date)) {
          title = t("activities.groups.today");
        } else if (isYesterday(date)) {
          title = t("activities.groups.yesterday");
        }

        if (!grouped[title]) {
          grouped[title] = [];
        }

        grouped[title].push(bookmark);
      });

    const flattened: FlattenedBookmark[] = [];
    Object.entries(grouped).forEach(([title, data]) => {
      flattened.push({ type: "header", title, id: `header-${title}` });
      data.forEach((bookmark) => {
        flattened.push({
          type: "item",
          bookmark,
          id: `item-${bookmark.id}`,
        });
      });
    });

    return flattened;
  }, [bookmarks, removedUserIds, t]);

  const { palette } = useColorPalette();
  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = React.useState(0);

  const routes = React.useMemo(
    () => [
      { key: "bookmarks", title: t("activities.tabs.bookmarks.title") },
      { key: "incoming", title: t("activities.tabs.incomming.title") },
      { key: "outgoing", title: t("activities.tabs.outgoing.title") },
    ],
    [t],
  );

  const tabOptions = React.useMemo(
    () => ({
      bookmarks: {
        labelText: t("activities.tabs.bookmarks.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
      incoming: {
        labelText: t("activities.tabs.incomming.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
      outgoing: {
        labelText: t("activities.tabs.outgoing.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
    }),
    [t],
  );

  const renderScene = React.useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case "bookmarks":
          return isBookmarksPending ? (
            <BookmarkSkeleton count={3} />
          ) : (
            <LegendList
              style={{ flex: 1, paddingBlock: 12 }}
              data={flattenedData}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              onRefresh={refetchBookmarks}
              refreshing={isRefetching}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                paddingHorizontal: 0,
                flexGrow: 1,
              }}
              renderItem={renderItem}
              ListEmptyComponent={() => (
                <View className="flex flex-col flex-1 justify-center items-center h-full">
                  <NotFound message={t("activities.bookmarks.empty")} />
                </View>
              )}
              ListFooterComponent={
                flattenedData.length === 0 ? null : (
                  <View className="items-center mb-8">
                    {isFetchingNextPage ? (
                      <Loader
                        size="small"
                        className="flex items-center h-fit"
                      />
                    ) : !hasNextPage ? (
                      <View className="flex flex-row items-center justify-center gap-2 px-4">
                        <Text variant="p" className="text-muted-foreground">
                          {t("activities.bookmarks.caughtUp")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )
              }
            />
          );
        case "incoming":
          return <SessionIncomingRequests handleScroll={handleScroll} />;
        case "outgoing":
          return <SessionOutgoingRequests handleScroll={handleScroll} />;
        default:
          return null;
      }
    },
    [
      isBookmarksPending,
      flattenedData,
      handleScroll,
      refetchBookmarks,
      isRefetching,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      renderItem,
      t,
    ],
  );

  return (
    <View className={cn("flex flex-1 flex-col", className)}>
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled={true}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled={false}
            options={tabOptions}
            indicatorStyle={{
              backgroundColor: hslToHex(palette.primary),
              height: 2,
            }}
            style={{
              backgroundColor: "transparent",
              elevation: 0,
              shadowOpacity: 0,
            }}
            activeColor={hslToHex(palette.foreground)}
            inactiveColor={hslToHex(palette.mutedForeground)}
            pressColor="transparent"
          />
        )}
      />
    </View>
  );
};
