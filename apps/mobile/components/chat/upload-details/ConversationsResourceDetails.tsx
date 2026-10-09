import React from "react";
import { useWindowDimensions } from "react-native";
import {
  StableSafeAreaView,
  ApplicationHeader,
  AppHeaderBack,
  hslToHex,
  useColorPalette,
} from "@instanct/mobile-components";
import { TabView, TabBar } from "react-native-tab-view";
import { ConversationMediaDetails } from "./ConversationMediaDetails";
import { ConversationFilesDetails } from "./ConversationFilesDetails";
import { ConversationLinksDetails } from "./ConversationLinksDetails";
import { useTranslation } from "react-i18next";

interface ConversationResourceDetailsProps {
  id: string;
}

/**
 * Top-tabbed portal screen switching between Media, Files, and Links shared in a conversation.
 */
export const ConversationResourceDetails = ({
  id,
}: ConversationResourceDetailsProps) => {
  const { t } = useTranslation("chat");
  const { palette } = useColorPalette();
  const layout = useWindowDimensions();
  const conversationId = Number(id);

  const [tabIndex, setTabIndex] = React.useState(0);

  const routes = React.useMemo(
    () => [
      { key: "media", title: t("chat.tabs.media.title") },
      { key: "files", title: t("chat.tabs.files.title") },
      { key: "links", title: t("chat.tabs.links.title") },
    ],
    [t],
  );

  const tabOptions = React.useMemo(
    () => ({
      media: {
        labelText: t("chat.tabs.media.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
      files: {
        labelText: t("chat.tabs.files.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
      links: {
        labelText: t("chat.tabs.links.title"),
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
        case "media":
          return <ConversationMediaDetails id={conversationId} />;
        case "files":
          return <ConversationFilesDetails id={conversationId} />;
        case "links":
          return <ConversationLinksDetails id={conversationId} />;
        default:
          return null;
      }
    },
    [conversationId],
  );

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <ApplicationHeader
        title={t("chat.resources.title")}
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
        reverse
        classNames={{ wrapper: "border-b border-border pb-2 bg-card" }}
      />

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
    </StableSafeAreaView>
  );
};
