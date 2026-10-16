import { Icon } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { MapPin } from "lucide-react-native";
import React from "react";
import { Dimensions, View } from "react-native";
import { LocationMap } from "@softsurgery/mobile-components";

const screenHeight = Dimensions.get("window").height;

interface RequestLocationSectionProps {
  className?: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  editable?: boolean;
}

export const RequestLocationSection = ({
  className,
  location,
  latitude,
  longitude,
}: RequestLocationSectionProps) => {
  return (
    <View className={cn("gap-3", className)}>
      {/* Lieu row with pin */}
      <View className="flex-row items-start gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
          <Icon as={MapPin} size={17} className="text-primary" />
        </View>
        <View className="flex-1 pt-0.5">
          <Text className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lieu
          </Text>
          <Text
            className={cn(
              "text-sm leading-5",
              location ? "text-foreground" : "italic text-muted-foreground/70",
            )}
          >
            {location || "Non spécifié"}
          </Text>
        </View>
      </View>

      {/* Shared LocationMap component */}
      <LocationMap
        latitude={latitude}
        longitude={longitude}
        location={location}
        className="mt-4 rounded-xl overflow-hidden"
        style={{ height: screenHeight * 0.4 }}
        initialDelta={{ latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        scrollEnabled={false}
        zoomEnabled={false}
        showLocationPill={false}
        showFullscreenToggle={true}
      />
    </View>
  );
};
