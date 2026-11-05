import React from "react";
import { Text } from "@softsurgery/mobile-ui";
import { identifyUser } from "@/lib/user";
import { cn } from "@softsurgery/lib";
import { createClientStore, useUserStore } from "@/stores/useUserStore";
import {
  ResponseEducationDto,
  ResponseExperienceDto,
  ServerErrorResponse,
} from "api-client";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { toUpdateExperienceDto } from "./experience/toUpdateExperienceDto";
import { toUpdateEducationDto } from "./education/toUpdateEducationDto";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { ProfileStat } from "./ProfileStat";
import {
  useCurrentUser,
  useEducations,
  useExperiences,
  useIdentifiedUser,
  useIndustries,
  useUserIndustries,
} from "api-client/hooks";
import { TabView, TabBar } from "react-native-tab-view";
import { AboutTab } from "./sections/AboutTab";
import { CareerTab } from "./sections/CareerTab";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileCover } from "./ProfileCover";
import { toast } from "sonner-native";
import { useApi } from "api-client/hooks";
import { useMutation } from "@tanstack/react-query";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import {
  hslToHex,
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { useScrollableElement } from "@softsurgery/mobile-hooks";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLoader } from "@/contexts/LoaderContext";

interface InspectBaseProfileProps {
  className?: string;
  id: string;
  coverExtra?: React.ReactNode;
}

export const InspectBaseProfile = ({
  className,
  id,
  coverExtra,
}: InspectBaseProfileProps) => {
  const api = useApi();
  const {
    animatedHeaderStyle,
    handleScroll,
    onLayout,
    showHeader,
    headerHeight,
    reset: resetHeader,
  } = useScrollableElement({
    deltaThreshold: 12,
    landscapeDeltaThreshold: 12,
    duration: 300,
    checkScrollable: false,
    collapseHeight: false,
  });
  const insets = useSafeAreaInsets();
  const { palette } = useColorPalette();
  const { t } = useTranslation("menu");
  const navigation = useNavigation();
  const { setLoading } = useLoader();

  const storeRef = React.useRef(createClientStore());

  const userStore = useUserStore();

  // user side-effects
  const { currentUser, refetchCurrentUser } = useCurrentUser();
  const { user, isUserPending, refetchUser } = useIdentifiedUser({ id });
  React.useEffect(() => {
    if (user) userStore?.set("response", user);
    navigation.setOptions({
      title: user?.username,
    });
  }, [user]);

  // experience side-effects
  const { experiences, isExperiencesPending, refetchExperiences } =
    useExperiences({ id, enabled: !!user });
  React.useEffect(() => {
    if (experiences) userStore?.set("experiences", experiences);
  }, [experiences]);

  // education side-effects
  const { educations, isEducationsPending, refetchEducations } = useEducations({
    id,
    enabled: !!user,
  });
  React.useEffect(() => {
    if (educations) userStore?.set("educations", educations);
  }, [educations]);

  // industries side-effects
  const { userIndustries, isUserIndustriesPending, refetchUserIndustries } =
    useUserIndustries({ userId: id, enabled: !!user });

  const { industries, isIndustriesSubTypePending } = useIndustries({
    enabled: !!user,
  });

  const identity = React.useMemo(() => identifyUser(user), [user]);

  const { mutate: sendVerifyEmail, isPending: isSendVerifyEmailPending } =
    useMutation({
      mutationFn: () => api.clientAuth.sendVerifyEmail({ email: user?.email }),
      onMutate: () => {
        setLoading(true);
      },
      onSettled: () => {
        setLoading(false);
      },
      onSuccess: () => {
        toast.success(t("menu.toasts.emailSent"), {
          description: t("menu.toasts.emailSentDescription"),
        });
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message || t("menu.toasts.emailError"),
          {},
        );
      },
    });

  React.useEffect(() => {
    return () => {
      storeRef.current = null as any;
      setLoading(false);
    };
  }, []);

  const emailVerification = React.useMemo(
    () => ({
      currentUser,
      user,
      id,
      sendVerifyEmail: () => sendVerifyEmail(),
      isSendVerifyEmailPending,
    }),
    [currentUser, user, id, sendVerifyEmail, isSendVerifyEmailPending],
  );

  const onRefresh = React.useCallback(async () => {
    await Promise.allSettled([
      refetchUser(),
      refetchCurrentUser(),
      refetchExperiences(),
      refetchEducations(),
      refetchUserIndustries(),
    ]);
  }, []);

  const refreshing =
    isUserPending ||
    isExperiencesPending ||
    isEducationsPending ||
    isIndustriesSubTypePending ||
    isUserIndustriesPending;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onRefresh();
      };
    }, [onRefresh]),
  );

  const handleEditExperience = React.useCallback(
    (experience: ResponseExperienceDto) => {
      userStore?.set("responseExperience", experience);
      userStore?.set("updateExperienceDto", toUpdateExperienceDto(experience));
      userStore?.set("present", experience.endDate == null);
      userStore?.set("experienceErrors", {});
      router.push("/main/profile/update-experience");
    },
    [userStore],
  );

  const handleEditEducation = React.useCallback(
    (education: ResponseEducationDto) => {
      userStore?.set("responseEducation", education);
      userStore?.set("updateEducationDto", toUpdateEducationDto(education));
      userStore?.set("educationErrors", {});
      router.push("/main/profile/update-education");
    },
    [userStore],
  );

  const selectedIndustries = React.useMemo(
    () =>
      industries.filter((industry) =>
        userIndustries?.some((industryId) => industryId === industry.id),
      ),
    [industries, userIndustries],
  );

  const editable = currentUser?.id === user?.id;

  const { width: screenWidth } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const leftPaneWidth = Math.min(Math.round(screenWidth * 0.42), 500);
  const [tabIndex, setTabIndex] = React.useState(0);
  const routes = React.useMemo(
    () => [
      { key: "about", title: t("menu.tabs.about.title") },
      { key: "career", title: t("menu.tabs.career.title") },
    ],
    [t],
  );

  const tabOptions = React.useMemo(
    () => ({
      about: {
        labelText: t("menu.tabs.about.title"),
        labelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          textTransform: "none" as const,
        },
      },
      career: {
        labelText: t("menu.tabs.career.title"),
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
        case "about":
          return (
            <AboutTab
              className="flex-1"
              user={user}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onScroll={isLandscape ? undefined : handleScroll}
            />
          );
        case "career":
          return (
            <CareerTab
              className="flex-1"
              experiences={experiences}
              educations={educations}
              industries={selectedIndustries}
              editable={editable}
              userId={id}
              onEditExperience={handleEditExperience}
              onEditEducation={handleEditEducation}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onScroll={isLandscape ? undefined : handleScroll}
            />
          );
        default:
          return null;
      }
    },
    [
      user,
      onRefresh,
      refreshing,
      isLandscape,
      handleScroll,
      experiences,
      educations,
      selectedIndustries,
      editable,
      id,
      handleEditExperience,
      handleEditEducation,
    ],
  );

  const animatedTabsStyle = useAnimatedStyle(() => {
    if (isLandscape) {
      return {
        paddingTop: insets.top,
        marginBottom: 0,
        transform: [{ translateY: 0 }],
      };
    }
    // Layout stays constant (header height reserved as padding); only
    // transforms animate, so scrolling never feeds back into layout.
    const h = headerHeight.value > 0 ? headerHeight.value : 0;
    const hiddenShift = Math.max(h - insets.top, 0);
    return {
      paddingTop: h,
      marginBottom: -hiddenShift,
      transform: [
        {
          translateY: withTiming(showHeader.value ? 0 : -hiddenShift, {
            duration: 300,
          }),
        },
      ],
    };
  });

  if (refreshing || !user) {
    return <BaseProfileSkeleton className={className} />;
  }

  const profileHeaderInfo = (
    <View
      className="z-50"
      style={{
        marginTop: isLandscape ? -40 : -48,
        paddingRight: isLandscape ? 16 : 20,
        paddingLeft: isLandscape ? Math.max(insets.left, 16) : 20,
      }}
    >
      <View className={"flex-row items-end justify-between"}>
        <ProfileAvatar
          user={user}
          currentUser={currentUser}
          onRefresh={onRefresh}
          size={isLandscape ? 76 : 100}
        />
        {currentUser?.id === id && !isLandscape && (
          <ProfileStat
            className="-mb-8"
            emailVerification={emailVerification}
          />
        )}
      </View>

      {/* Identity */}
      <View style={{ marginTop: isLandscape ? 8 : 12 }}>
        <Text
          className="text-2xl font-bold text-foreground"
          style={isLandscape ? { fontSize: 18, lineHeight: 26 } : undefined}
          numberOfLines={1}
        >
          {identity}
        </Text>
        {id && (
          <View className="flex-col items-start justify-between gap-2">
            <View className="flex flex-row items-center flex-wrap gap-2">
              <Text className="text-sm text-muted-foreground">
                @{user?.username}
              </Text>
              {!!user?.email &&
                !user?.emailVerified &&
                currentUser?.id === id && (
                  <Text className="text-xs text-yellow-600 font-bold">
                    ({t("menu.unverifiedEmail")})
                  </Text>
                )}
            </View>
            {isLandscape && (
              <ProfileStat emailVerification={emailVerification} />
            )}
          </View>
        )}
      </View>
    </View>
  );

  const tabViewElement = (
    <TabView
      style={{ flex: 1 }}
      navigationState={{ index: tabIndex, routes }}
      renderScene={renderScene}
      onIndexChange={(index) => {
        setTabIndex(index);
        resetHeader();
      }}
      initialLayout={{
        width: isLandscape ? screenWidth - leftPaneWidth : screenWidth,
      }}
      swipeEnabled={true}
      renderTabBar={(props) => (
        <TabBar
          key={isLandscape ? "landscape" : "portrait"}
          {...props}
          scrollEnabled={false}
          options={tabOptions}
          tabStyle={{
            flex: 1,
            minHeight: isLandscape ? 38 : 48,
            paddingVertical: isLandscape ? 4 : 8,
          }}
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
  );

  return (
    <View
      className={cn("bg-background flex-1", className)}
      style={{ flexDirection: isLandscape ? "row" : "column" }}
    >
      {isLandscape ? (
        <View
          className="border-r border-border/40 bg-background"
          style={{ width: leftPaneWidth }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <ProfileCover
              user={user}
              currentUser={currentUser}
              onRefresh={onRefresh}
              coverExtra={coverExtra}
            />
            {profileHeaderInfo}
          </ScrollView>
        </View>
      ) : (
        <Animated.View
          style={[
            animatedHeaderStyle,
            { position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 },
          ]}
        >
          <View onLayout={onLayout}>
            {/* Cover */}
            <ProfileCover
              user={user}
              currentUser={currentUser}
              onRefresh={onRefresh}
              coverExtra={coverExtra}
            />
            {/* Header */}
            {profileHeaderInfo}
          </View>
        </Animated.View>
      )}

      {/* Tabs */}
      {isLandscape ? (
        <View
          key="landscape-tabs"
          className="flex-1"
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingRight: insets.right,
          }}
        >
          {tabViewElement}
        </View>
      ) : (
        <Animated.View
          key="portrait-tabs"
          className="flex-1"
          style={[
            animatedTabsStyle,
            !user?.emailVerified ? { marginTop: 8 } : undefined,
          ]}
        >
          {tabViewElement}
        </Animated.View>
      )}
    </View>
  );
};
