import React from "react";
import {
  View,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Maximize2, MapPin, X, MapPinOff } from "lucide-react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { useColorPalette } from "./hooks/useColorPalette";
import { AndroidDarkMapStyle } from "./lib/mapStyles";

export interface LocationMapProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  mapClassName?: string;
  mapStyle?: StyleProp<ViewStyle>;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  title?: string;
  description?: string;
  initialDelta?: {
    latitudeDelta: number;
    longitudeDelta: number;
  };
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  showFullscreenToggle?: boolean;
  showLocationPill?: boolean;
  pillPosition?: "top" | "bottom";
  pinColor?: string;
  customMapStyle?: any[];
  userInterfaceStyle?: "light" | "dark";
  fallbackText?: string;
  subFallbackText?: string;
  renderMarker?: (coordinate: {
    latitude: number;
    longitude: number;
  }) => React.ReactNode;
  renderFallback?: () => React.ReactNode;
}

export const LocationMap = ({
  className,
  style,
  mapClassName,
  mapStyle,
  latitude,
  longitude,
  location,
  title,
  description,
  initialDelta = { latitudeDelta: 0.05, longitudeDelta: 0.05 },
  scrollEnabled = false,
  zoomEnabled = false,
  rotateEnabled = false,
  pitchEnabled = false,
  showFullscreenToggle = true,
  showLocationPill = true,
  pillPosition = "bottom",
  pinColor,
  customMapStyle,
  userInterfaceStyle,
  fallbackText,
  subFallbackText,
  renderMarker,
  renderFallback,
}: LocationMapProps) => {
  const { palette, colorScheme } = useColorPalette();
  const insets = useSafeAreaInsets();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const numLat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  const numLng =
    typeof longitude === "string" ? parseFloat(longitude) : longitude;

  const hasCoordinates =
    numLat != null &&
    numLng != null &&
    !(numLat === 0 && numLng === 0) &&
    !isNaN(numLat) &&
    !isNaN(numLng);

  const region = React.useMemo(() => {
    if (!hasCoordinates) return null;
    return {
      latitude: numLat!,
      longitude: numLng!,
      latitudeDelta: initialDelta.latitudeDelta,
      longitudeDelta: initialDelta.longitudeDelta,
    };
  }, [
    hasCoordinates,
    numLat,
    numLng,
    initialDelta.latitudeDelta,
    initialDelta.longitudeDelta,
  ]);

  const resolvedMapStyle =
    customMapStyle !== undefined
      ? customMapStyle
      : colorScheme === "dark" && Platform.OS === "android"
        ? AndroidDarkMapStyle
        : undefined;

  const resolvedUiStyle =
    userInterfaceStyle ?? (colorScheme === "dark" ? "dark" : "light");

  const effectivePinColor = pinColor ?? palette.primary;

  if (!hasCoordinates || !region) {
    if (renderFallback) {
      return <>{renderFallback()}</>;
    }
    if (fallbackText) {
      return (
        <View
          style={style}
          className={cn(
            "rounded-2xl border border-dashed border-border bg-card p-6 items-center justify-center",
            className,
          )}
        >
          <View className="w-12 h-12 rounded-full bg-muted/40 items-center justify-center mb-2">
            <Icon as={MapPinOff} size={22} className="text-muted-foreground" />
          </View>
          <Text className="text-sm font-semibold text-foreground text-center">
            {fallbackText}
          </Text>
          {subFallbackText && (
            <Text className="text-xs text-muted-foreground text-center mt-1">
              {subFallbackText}
            </Text>
          )}
        </View>
      );
    }
    return null;
  }

  const renderLocationPill = (extraClassName?: string) => {
    if (!location) return null;
    return (
      <View
        className={cn(
          "bg-card/95 backdrop-blur-md p-4 rounded-2xl border border-border",
          extraClassName,
        )}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
            <Icon as={MapPin} size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-bold text-foreground"
              numberOfLines={2}
            >
              {location}
            </Text>
            {subFallbackText && (
              <Text className="text-xs text-muted-foreground mt-0.5">
                {subFallbackText}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={style}
      className={cn(
        "rounded-2xl overflow-hidden border border-border relative bg-muted/20",
        className,
      )}
    >
      <MapView
        style={[{ width: "100%", height: "100%" }, mapStyle]}
        className={mapClassName}
        initialRegion={region}
        customMapStyle={resolvedMapStyle}
        userInterfaceStyle={resolvedUiStyle}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        rotateEnabled={rotateEnabled}
        pitchEnabled={pitchEnabled}
      >
        {renderMarker ? (
          renderMarker({
            latitude: region.latitude,
            longitude: region.longitude,
          })
        ) : (
          <Marker
            coordinate={region}
            pinColor={effectivePinColor}
            title={title ?? undefined}
            description={description ?? location ?? undefined}
          />
        )}
      </MapView>

      {/* Floating controls (location pill & fullscreen toggle) */}
      {(Boolean(showLocationPill && location) || showFullscreenToggle) && (
        <View
          pointerEvents="box-none"
          className={cn(
            "absolute left-3 right-3 flex-row items-center gap-4",
            pillPosition === "top" ? "top-3" : "bottom-3",
            !(showLocationPill && location) && "justify-end",
          )}
        >
          {showLocationPill && location && renderLocationPill("flex-1")}

          {showFullscreenToggle && (
            <Pressable
              onPress={() => setIsFullscreen(true)}
              hitSlop={6}
              className="h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-card/95 backdrop-blur-md border border-border active:opacity-80"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
              }}
            >
              <Icon as={Maximize2} size={20} className="text-foreground" />
            </Pressable>
          )}
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-background">
          <MapView
            style={{ flex: 1 }}
            initialRegion={region}
            customMapStyle={resolvedMapStyle}
            userInterfaceStyle={resolvedUiStyle}
            showsCompass
            showsScale
          >
            {renderMarker ? (
              renderMarker({
                latitude: region.latitude,
                longitude: region.longitude,
              })
            ) : (
              <Marker
                coordinate={region}
                pinColor={effectivePinColor}
                title={title ?? undefined}
                description={description ?? location ?? undefined}
              />
            )}
          </MapView>

          {/* Close button */}
          <Pressable
            onPress={() => setIsFullscreen(false)}
            hitSlop={8}
            className="absolute h-11 w-11 items-center justify-center rounded-full bg-card/95 active:opacity-80"
            style={{
              top: insets.top + 12,
              right: 16,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Icon as={X} size={18} className="text-foreground" />
          </Pressable>

          {/* Location pill in fullscreen */}
          {location && (
            <View
              pointerEvents="box-none"
              className="absolute left-4 right-4 flex-row items-center"
              style={{
                bottom: insets.bottom + 16,
              }}
            >
              {renderLocationPill("flex-1")}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};
