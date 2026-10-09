import type { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import React from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Text } from "@instanct/mobile-ui";
import { format } from "date-fns";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { Badge } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { TabView, TabBar } from "react-native-tab-view";
import { hslToHex, useColorPalette } from "@instanct/mobile-components";
import { Separator } from "@instanct/mobile-ui";
import { ArrowRight } from "lucide-react-native";
import { Icon } from "@instanct/mobile-ui";
import { SessionIncomingRequests } from "../../activities/SessionIncomingRequests";
import { SessionOutgoingRequests } from "../../activities/SessionOutgoingRequests";
import { useTranslation } from "react-i18next";

interface SessionDetailsContentProps {
  session: ResponseSessionDto<MapSessionPayload>;
}

const toValidDate = (value?: Date | string | null) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
};

export const SessionDetailsContent = ({
  session,
}: SessionDetailsContentProps) => {
  const { t } = useTranslation("activities");
  const { palette } = useColorPalette();
  const layout = useWindowDimensions();
  const { objectives, isObjectivesSubTypePending } = useObjectives();

  const [tabIndex, setTabIndex] = React.useState(0);

  const payloadObjectiveIds = React.useMemo(
    () => (session.payload?.objectives ?? []).map(String),
    [session.payload?.objectives],
  );

  const objectivesById = React.useMemo(
    () => new Map(objectives.map((o) => [String(o.id), o.label])),
    [objectives],
  );

  const selectedObjectives = React.useMemo(
    () =>
      payloadObjectiveIds.map((id) => ({
        id,
        label: objectivesById.get(id) ?? id,
        isResolved: objectivesById.has(id),
      })),
    [payloadObjectiveIds, objectivesById],
  );

  const formatSessionWindow = (
    session: ResponseSessionDto<MapSessionPayload>,
  ) => {
    const start = toValidDate(session.plannedStart);
    const end = toValidDate(session.plannedEnd);

    return (
      <View className="bg-card border border-border rounded-lg p-4">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Scheduled Window
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground">Starts</Text>
            <Text className="text-sm font-semibold text-foreground mt-0.5">
              {start ? format(start, "MMM d, yyyy") : "Not set"}
            </Text>
            {start && (
              <Text className="text-xs text-muted-foreground mt-0.5">
                {format(start, "p")}
              </Text>
            )}
          </View>

          <View className="px-2">
            <Icon as={ArrowRight} size={16} className="text-muted-foreground" />
          </View>

          {end && (
            <View className="flex-1 items-end">
              <Text className="text-xs text-muted-foreground">Ends</Text>
              <Text className="text-sm font-semibold text-foreground mt-0.5">
                {format(end, "MMM d, yyyy")}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {format(end, "p")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const routes = React.useMemo(
    () => [
      {
        key: "info",
        title: t("activities.tabs.informations.title", "Informations"),
      },
      {
        key: "incoming",
        title: t("activities.tabs.incomming.title"),
      },
      {
        key: "outgoing",
        title: t("activities.tabs.outgoing.title"),
      },
    ],
    [t],
  );

  const tabOptions = React.useMemo(
    () => ({
      info: {
        labelText: t("activities.tabs.informations.title", "Informations"),
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
        case "info":
          return (
            <ScrollView
              className="flex-1"
              contentContainerClassName="px-4 pt-4 pb-8 gap-4"
              showsVerticalScrollIndicator={false}
            >
              {formatSessionWindow(session)}

              <View className="bg-card border border-border rounded-lg overflow-hidden">
                <View className="px-4 py-4 flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold">Objectives</Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      Selected objectives for this session.
                    </Text>
                  </View>
                  {payloadObjectiveIds.length > 0 ? (
                    <Badge variant="secondary">
                      <Text className="text-xs">{payloadObjectiveIds.length}</Text>
                    </Badge>
                  ) : null}
                </View>

                <Separator />

                <View className="px-4 py-4">
                  {payloadObjectiveIds.length === 0 ? (
                    <Text className="text-sm text-muted-foreground italic">
                      No objectives selected.
                    </Text>
                  ) : isObjectivesSubTypePending ? (
                    <Text className="text-sm text-muted-foreground">
                      Loading objectives…
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {selectedObjectives.map(({ id, label, isResolved }) => (
                        <Badge
                          key={id}
                          variant={"outline"}
                          className={cn(
                            "px-2 py-1 rounded-full",
                            !isResolved && "opacity-70",
                          )}
                        >
                          <Text className="text-xs">{label}</Text>
                        </Badge>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          );
        case "incoming":
          return <SessionIncomingRequests />;
        case "outgoing":
          return <SessionOutgoingRequests />;
        default:
          return null;
      }
    },
    [
      session,
      payloadObjectiveIds,
      isObjectivesSubTypePending,
      selectedObjectives,
    ],
  );

  return (
    <View className="flex flex-1 flex-col">
      <View className="flex-1">
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
    </View>
  );
};
