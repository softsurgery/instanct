import React from "react";
import { useRNServerImages } from "@softsurgery/mobile-hooks";
import { identifyUserAvatar } from "@/lib/user";
import { NearbyUser } from "@/types";
import { Platform, View } from "react-native";
import { File as ExpoFile } from "expo-file-system";
import { Marker } from "react-native-maps";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import { Text } from "@softsurgery/mobile-ui";

const CLUSTER_AVATAR_SIZE = { width: 30, height: 30 };

interface UsersMarkerProps {
  nearbyUsers: NearbyUser[];
  totalCount?: number;
  latitude: number;
  longitude: number;
  currentUserIncluded?: boolean;
  onPress: (users: NearbyUser[] | null) => void;
}

export const UsersMarker = React.memo(function UsersMarker({
  nearbyUsers,
  totalCount,
  latitude,
  longitude,
  currentUserIncluded,
  onPress,
}: UsersMarkerProps) {
  const { width } = CLUSTER_AVATAR_SIZE;
  const isAndroid = Platform.OS === "android";

  // Android self-capture state
  const viewShotRef = React.useRef<ViewShotRef>(null);
  const captureTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastUriRef = React.useRef<string | null>(null);
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  const displayUsers = React.useMemo(
    () => nearbyUsers.slice(0, 3),
    [nearbyUsers],
  );
  const pictureIds = React.useMemo(
    () => displayUsers.map((u) => u?.user?.pictureId),
    [displayUsers],
  );
  const pictureFallbacks = React.useMemo(
    () => displayUsers.map((u) => identifyUserAvatar(u?.user)),
    [displayUsers],
  );

  const { jsxArray: userPictures } = useRNServerImages({
    ids: pictureIds,
    className: "rounded-full",
    fallbackClassName: "text-xs",
    imageOptions: CLUSTER_AVATAR_SIZE,
    fallbacks: pictureFallbacks,
  });

  const deleteFileQuietly = React.useCallback((uri: string | null) => {
    if (!uri) return;
    try {
      new ExpoFile(uri).delete();
    } catch {
      // Ignore cleanup errors for already-removed tmpfiles
    }
  }, []);

  const capture = React.useCallback(async () => {
    try {
      if (viewShotRef.current) {
        const uri = await (viewShotRef.current as any).capture();
        if (lastUriRef.current && lastUriRef.current !== uri) {
          deleteFileQuietly(lastUriRef.current);
        }
        lastUriRef.current = uri;
        setImageUri(uri);
      }
    } catch {
      // View not ready yet
    }
  }, [deleteFileQuietly]);

  React.useEffect(() => {
    return () => {
      captureTimersRef.current.forEach(clearTimeout);
      captureTimersRef.current = [];
      deleteFileQuietly(lastUriRef.current);
      lastUriRef.current = null;
    };
  }, [deleteFileQuietly]);

  const handleLayout = React.useCallback(() => {
    if (!isAndroid) return;
    captureTimersRef.current.forEach(clearTimeout);
    // Capture after a short delay for images to settle
    captureTimersRef.current = [
      setTimeout(capture, 200),
      setTimeout(capture, 1200),
    ];
  }, [isAndroid, capture]);

  const count = totalCount ?? nearbyUsers.length;
  const label = currentUserIncluded
    ? `You & ${count - 1} Person${count - 1 > 1 ? "s" : ""}`
    : `${count} Person${count > 1 ? "s" : ""}`;

  const content = (
    <View
      className="flex flex-col items-center justify-center"
      collapsable={false}
    >
      {/* Overlapping user icons */}
      <View className="flex flex-row items-center justify-center">
        {displayUsers.map((user, index) => (
          <View
            key={user.userId}
            style={{
              marginLeft:
                nearbyUsers.length > 2 ? (index === 0 ? 0 : -width * 0.4) : 0,
              zIndex: displayUsers.length - index,
            }}
          >
            {userPictures[index]}
          </View>
        ))}
      </View>

      {/* Label */}
      <Text className="mt-1 text-xs font-extrabold bg-background/60 px-2 py-1 rounded-lg text-center">
        {label}
      </Text>
    </View>
  );

  // Android with captured image: use image prop (bypasses canvas bug)
  if (isAndroid && imageUri) {
    return (
      <Marker
        coordinate={{ latitude, longitude }}
        onPress={() => onPress(nearbyUsers)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
        image={{ uri: imageUri }}
      />
    );
  }

  // Android without capture yet: render children in ViewShot to capture
  if (isAndroid) {
    return (
      <Marker
        coordinate={{ latitude, longitude }}
        onPress={() => onPress(nearbyUsers)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", result: "tmpfile" }}
          onLayout={handleLayout}
        >
          {content}
        </ViewShot>
      </Marker>
    );
  }

  // iOS: render children directly
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(nearbyUsers)}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      {content}
    </Marker>
  );
});
