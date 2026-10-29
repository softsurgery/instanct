import { cn } from "@softsurgery/lib";
import { Dimensions, View } from "react-native";
import { LocationMap } from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("activities");

  const hasLocationInfo = Boolean(
    location || (latitude != null && longitude != null),
  );

  if (!hasLocationInfo) {
    return null;
  }

  const displayLocation =
    location ||
    (latitude != null && longitude != null
      ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
      : null);

  return (
    <View className={cn(className)}>
      {/* Shared LocationMap component with location displayed directly on map */}
      <LocationMap
        latitude={latitude}
        longitude={longitude}
        location={displayLocation}
        title={location ?? undefined}
        className="rounded-xl overflow-hidden"
        style={{ height: screenHeight * 0.4 }}
        initialDelta={{ latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        scrollEnabled={false}
        zoomEnabled={false}
        showLocationPill={true}
        showFullscreenToggle={true}
        fallbackText={
          displayLocation || t("activities.request.placeholders.location")
        }
      />
    </View>
  );
};
