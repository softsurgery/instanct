import {
  hslToHex,
  SeeMoreText,
  useColorPalette,
} from "@softsurgery/mobile-components";
import { Text, Icon } from "@softsurgery/mobile-ui";
import { THEME } from "@/lib/theme";
import { cn } from "@softsurgery/lib";
import { ResponseUserDto } from "api-client";
import {
  ArrowUpRight,
  Globe,
  Linkedin,
  Link2,
  UserRound,
  LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

interface AboutTabProps {
  className?: string;
  user: ResponseUserDto | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const SectionHeader = ({
  icon,
  title,
  color = hslToHex(THEME.light.primary),
}: {
  icon: LucideIcon;
  title: string;
  color?: string;
}) => (
  <View className="mb-4 flex-row items-center gap-2.5">
    <Icon as={icon} size={24} color={color} />
    <Text className="text-xl font-semibold text-foreground">{title}</Text>
  </View>
);

const cleanUrl = (url: string) =>
  url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

const AboutLink = ({
  icon,
  label,
  subtitle,
  color,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  color: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="link"
    onPress={onPress}
    className="flex-row items-center gap-3 py-3 active:opacity-60"
  >
    <Icon as={icon} size={20} color={color} />

    <View className="min-w-0 flex-1 gap-1">
      <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
        {label}
      </Text>

      {subtitle ? (
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>

    <Icon as={ArrowUpRight} size={18} color={color} />
  </Pressable>
);

export const AboutTab = ({
  className,
  user,
  refreshing,
  onRefresh,
  onScroll,
}: AboutTabProps) => {
  const { t } = useTranslation("menu");
  const { palette } = useColorPalette();

  const primary = hslToHex(palette.primary);
  const hasLinks = !!(user?.website || user?.linkedin);

  return (
    <ScrollView
      className={cn(className)}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingTop: 24,
        paddingBottom: 36,
      }}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-8 px-5">
        {/* Bio */}
        <View>
          <SectionHeader
            icon={UserRound}
            title={t("menu.tabs.about.title")}
            color={primary}
          />

          {user?.bio ? (
            <SeeMoreText
              textClassname="text-sm leading-7 text-foreground"
              numberOfLines={4}
            >
              {user.bio.trim()}
            </SeeMoreText>
          ) : (
            <Text className="text-sm leading-6 text-muted-foreground">
              {t("menu.tabs.about.empty")}
            </Text>
          )}
        </View>

        {/* Links */}
        {hasLinks && (
          <View>
            <SectionHeader
              icon={Link2}
              title={t("menu.tabs.about.links.title")}
              color={primary}
            />

            <View>
              {user?.website && (
                <AboutLink
                  icon={Globe}
                  label="Website"
                  subtitle={cleanUrl(user.website)}
                  color={primary}
                  onPress={() => Linking.openURL(user.website!)}
                />
              )}

              {user?.linkedin && (
                <AboutLink
                  icon={Linkedin}
                  label={t("menu.tabs.about.links.linkedin")}
                  color={primary}
                  onPress={() => Linking.openURL(user.linkedin!)}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
