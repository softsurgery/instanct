import React from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import {
  Briefcase,
  GraduationCap,
  LucideIcon,
  Pen,
  Plus,
  Tag,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ResponseEducationDto,
  ResponseExperienceDto,
  ResponseRefParamDto,
} from "api-client";
import { hslToHex, useColorPalette } from "@softsurgery/mobile-components";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { ExperienceInstance } from "../experience/ExperienceInstance";
import { EducationInstance } from "../education/EducationInstance";

interface CareerTabProps {
  className?: string;
  experiences?: ResponseExperienceDto[];
  educations?: ResponseEducationDto[];
  industries?: ResponseRefParamDto[];
  editable?: boolean;
  userId?: string;
  onEditExperience?: (experience: ResponseExperienceDto) => void;
  onEditEducation?: (education: ResponseEducationDto) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const SectionHeader = ({
  icon,
  title,
  count = 0,
  color,
  editable,
  actionIcon,
  actionIconSize = 18,
  onActionPress,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  color: string;
  editable?: boolean;
  actionIcon: LucideIcon;
  actionIconSize?: number;
  onActionPress: () => void;
}) => (
  <View className="flex-row items-center justify-between">
    <View className="flex-row items-center gap-2.5">
      <Icon as={icon} size={24} color={color} />
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      {count > 0 && (
        <View className="items-center rounded-full px-1.5 py-0.5 bg-primary/10">
          <Text className="text-sm font-bold">{count}</Text>
        </View>
      )}
    </View>

    {editable && (
      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full border border-border active:bg-primary/15"
        onPress={onActionPress}
      >
        <Icon as={actionIcon} size={actionIconSize} color={color} />
      </Pressable>
    )}
  </View>
);

const EmptySection = ({ title }: { title: string }) => (
  <View className="items-center rounded-2xl border border-dashed border-border py-6">
    <Text className="text-sm italic text-muted-foreground">
      No {title.toLowerCase()} added yet
    </Text>
  </View>
);

export const CareerTab = ({
  className,
  experiences = [],
  educations = [],
  industries = [],
  editable = false,
  userId,
  onEditExperience,
  onEditEducation,
  onRefresh,
  refreshing,
  onScroll,
}: CareerTabProps) => {
  const { t } = useTranslation("menu");
  const { palette } = useColorPalette();
  const primary = hslToHex(palette.primary);

  const experienceTitle = t("menu.tabs.career.experience.title");
  const educationTitle = t("menu.tabs.career.education.title");
  const industriesTitle = t("menu.tabs.career.industries.title");

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      className={cn("flex-1 bg-background", className)}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-col gap-4">
        {/* Experience Section */}
        <View className="px-4">
          <SectionHeader
            icon={Briefcase}
            title={experienceTitle}
            count={experiences.length}
            color={primary}
            editable={editable}
            actionIcon={Plus}
            actionIconSize={18}
            onActionPress={() => router.push("/main/profile/create-experience")}
          />

          <View className="pt-3">
            {experiences.length === 0 ? (
              <EmptySection title={experienceTitle} />
            ) : (
              <View>
                {experiences.map((experience, idx) => (
                  <View key={experience.id ?? idx} className="my-4">
                    <ExperienceInstance
                      experience={experience}
                      editable={editable}
                      onEdit={() => onEditExperience?.(experience)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Education Section */}
        <View className="px-4">
          <SectionHeader
            icon={GraduationCap}
            title={educationTitle}
            count={educations.length}
            color={primary}
            editable={editable}
            actionIcon={Plus}
            actionIconSize={18}
            onActionPress={() => router.push("/main/profile/create-education")}
          />

          <View className="pt-3">
            {educations.length === 0 ? (
              <EmptySection title={educationTitle} />
            ) : (
              <View>
                {educations.map((education, idx) => (
                  <View key={education.id ?? idx} className="my-4">
                    <EducationInstance
                      education={education}
                      editable={editable}
                      onEdit={() => onEditEducation?.(education)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Industries Section */}
        <View className="px-4">
          <SectionHeader
            icon={Tag}
            title={industriesTitle}
            count={industries.length}
            color={primary}
            editable={editable}
            actionIcon={Pen}
            actionIconSize={16}
            onActionPress={() =>
              router.push({
                pathname: "/main/profile/industries",
                params: { userId },
              })
            }
          />

          <View className="pt-3">
            {industries.length === 0 ? (
              <EmptySection title={industriesTitle} />
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {industries.map((industry, idx) => (
                  <View
                    key={industry.id ?? idx}
                    className="rounded-full border border-border px-3 py-1.5"
                  >
                    <Text className="text-[13px] font-semibold">
                      {industry.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
