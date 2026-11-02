import { Image } from "expo-image";
import * as React from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Text, Icon } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { SSOButtons } from "./SSOButtons";
import { Languages } from "lucide-react-native";
import {
  ThemeToggle,
  LanguageSwitcher,
  StableSafeAreaView,
} from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import {
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { useLayoutConfig } from "@/config/wrapper-config";

const ONBOARDING_DATA = [
  {
    key: "welcome",
    image: require("~/assets/images/onboarding-welcome.png"),
  },
  {
    key: "integration",
    image: require("~/assets/images/onboarding-integration.png"),
  },
  {
    key: "security",
    image: require("~/assets/images/onboarding-security.png"),
  },
];

interface OnBoardingProps {
  className?: string;
}

export default function OnBoarding({ className }: OnBoardingProps) {
  const { safeAreaClassNames } = useLayoutConfig();
  const { t } = useTranslation("explore");
  const { palette, colorScheme } = useColorPalette();
  const { width, height } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const carouselHeight = isLandscape ? 170 : 280;

  return (
    <StableSafeAreaView
      classNames={{
        safearea: safeAreaClassNames.safearea,
        wrapper: cn(safeAreaClassNames.wrapper, "bg-background"),
      }}
      className={cn("flex-1 justify-between", className)}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 flex flex-col justify-between py-4">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row gap-3 px-6 items-center">
              <Image
                source={require("~/assets/images/icon.png")}
                style={{
                  width: isLandscape ? 44 : 60,
                  height: isLandscape ? 44 : 60,
                  borderRadius: 12,
                }}
                contentFit="cover"
              />
              <Text
                className={cn(
                  "font-extrabold tracking-tight mt-2",
                  isLandscape ? "text-2xl" : "text-3xl",
                )}
              >
                Instanct
              </Text>
            </View>
            <View className="flex flex-row items-center mr-4">
              <LanguageSwitcher
                customTrigger={
                  <View className="mx-2">
                    <Icon
                      as={Languages}
                      className="text-foreground"
                      size={24}
                    />
                  </View>
                }
              />
              <ThemeToggle classNames={{ trigger: "mx-2" }} />
            </View>
          </View>

          <View className={cn("flex-1 justify-center items-center")}>
            <Carousel
              key={`carousel-${colorScheme}-${isLandscape}`}
              width={width}
              ref={ref}
              style={{ width: width, height: carouselHeight }}
              data={ONBOARDING_DATA}
              onProgressChange={progress}
              renderItem={({ item }) => {
                return (
                  <View className="flex-1 justify-center items-center px-8">
                    <View
                      className={cn(
                        "items-center justify-center",
                        isLandscape ? "mb-1" : "mb-4",
                      )}
                    >
                      <Image
                        source={item.image}
                        style={{
                          height: (isLandscape ? width : height) * 0.1,
                          aspectRatio: 1,
                        }}
                        contentFit="contain"
                      />
                    </View>
                    <Text
                      className={cn(
                        "font-bold text-center text-foreground",
                        isLandscape ? "text-xl mb-1" : "text-3xl mb-2",
                      )}
                    >
                      {t(`onBoarding.slides.${item.key}.title`)}
                    </Text>
                    <Text
                      className={cn(
                        "text-center text-muted-foreground leading-relaxed",
                        isLandscape ? "text-xs" : "text-base",
                      )}
                    >
                      {t(`onBoarding.slides.${item.key}.description`)}
                    </Text>
                  </View>
                );
              }}
              autoPlayInterval={4000}
              autoPlay
            />

            <Pagination.Basic
              key={`pagination-${colorScheme}`}
              progress={progress}
              data={ONBOARDING_DATA}
              dotStyle={{
                backgroundColor: palette.mutedForeground,
                borderRadius: 50,
                width: 8,
                height: 8,
              }}
              activeDotStyle={{
                backgroundColor: palette.foreground,
                width: 24,
                height: 8,
                borderRadius: 50,
              }}
              containerStyle={{
                gap: 8,
                marginTop: isLandscape ? 10 : 24,
              }}
              onPress={onPressPagination}
            />
          </View>

          <View
            className={cn(
              "mx-6 mb-4",
              isLandscape ? "mt-4 max-w-xl self-center w-full" : "mt-8",
            )}
          >
            <SSOButtons isSignInPending={false} classic acceptTermsRequired />
          </View>
        </View>
      </ScrollView>
    </StableSafeAreaView>
  );
}
