import { cn } from "@softsurgery/lib";
import { View } from "react-native";
import { Icon } from "@softsurgery/mobile-ui";
import * as Haptics from "expo-haptics";
import { Crosshair, RefreshCcw, SatelliteDish } from "lucide-react-native";
import { useMapStore } from "@/stores/useMapStore";
import { useLiveGeolocation } from "api-client/hooks";
import {
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MapModesProps {
  className?: string;
  moveToCurrentLocation?: () => void;
}

export const MapModes = ({
  className,
  moveToCurrentLocation,
}: MapModesProps) => {
  const { isLandscape } = useScreenOrientation();
  const insets = useSafeAreaInsets();
  const { palette } = useColorPalette();
  const { restartSocket } = useLiveGeolocation({ enabled: false });
  const mapStore = useMapStore();
  const modes = [
    {
      key: "refresh",
      icon: RefreshCcw,
      onPress: () => {
        restartSocket();
      },
    },
    {
      key: "globe",
      icon: SatelliteDish,
      color:
        mapStore.settings.mode !== "map" ? palette.primary : palette.foreground,
      onPress: () => {
        if (mapStore.settings.mode === "map")
          mapStore.setNested("settings.mode", "sattelite");
        else mapStore.setNested("settings.mode", "map");
      },
    },
    {
      key: "move-to-current",
      icon: Crosshair,
      onPress: () => {
        moveToCurrentLocation?.();
      },
    },
  ];

  const withHaptic = (functions: Function[]) => {
    return async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      functions.forEach((fn) => fn());
    };
  };

  return (
    <View
      className={cn(
        "flex flex-col bg-background/75 absolute z-50 h-auto items-center justify-center rounded-b-full rounded-t-full",
        isLandscape ? "px-2.5 py-2.5 gap-3" : "px-3 py-4 gap-4",
        className,
      )}
      style={{
        top: isLandscape ? insets.top + 75 : "15%",
        right: Math.max(insets.right, 12),
      }}
    >
      {modes.map(({ key, icon, color, onPress }) => (
        <Icon
          key={key}
          as={icon}
          size={24}
          onPress={withHaptic([onPress])}
          {...(color ? { color } : {})}
        />
      ))}
    </View>
  );
};
