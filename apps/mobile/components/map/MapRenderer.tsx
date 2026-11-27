import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView from "react-native-map-clustering";
import { Marker, Region } from "react-native-maps";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useShallow } from "zustand/react/shallow";
import {
  useColorPalette,
  usePulseAnimation,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { AndroidPulseOverlay, MarkerCaptureLayer } from "./AndroidMarker";
import { UsersCarousel } from "./UserCarousel/UsersCarousel";
import { UserMarker } from "./UserMarker";
import { SingleUserSheet } from "./SingleUserSheet";
import { UsersMarker } from "./UsersMarker";
import { UsersModalContent } from "./UsersModalContent";
import { AndroidDarkMapStyle } from "./utils/AndroidDarkMapStyle";
import { useCurrentUser } from "api-client/hooks";
import { useLiveGeolocationParameters } from "api-client/hooks/geolocation";
import { MapModes } from "./MapModes";
import { MapRendererService } from "./MapRendererService";

interface MapRendererProps {
  className?: string;
  style?: Record<string, any>;
  latitude: number;
  longitude: number;
  nearbyUsers?: NearbyUser[];
  isActive?: boolean;
}

export const MapRenderer = ({
  className,
  style,
  latitude,
  longitude,
  isActive = true,
}: MapRendererProps) => {
  const { isLandscape } = useScreenOrientation();
  const insets = useSafeAreaInsets();
  const { currentUser } = useCurrentUser();
  const { colorScheme } = useColorScheme();
  const mapRef = React.useRef<MapView>(null);
  const superCluster = React.useRef<any>(null);
  const serviceRef = React.useRef<MapRendererService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new MapRendererService();
  }
  const service = serviceRef.current;

  const nearbyUsers = useMapStore(useShallow((s) => s.nearbyUsers));
  const nearbyUsersById = useMapStore((s) => s.nearbyUsersById);
  const usersById = useMapStore((s) => s.usersById);
  const showUsernames = useMapStore((s) => s.settings.showUsernames);
  const mapMode = useMapStore((s) => s.settings.mode);
  const { isPending } = useLiveGeolocationParameters();
  const { palette } = useColorPalette();

  const singleUserSheetRef = React.useRef<ActionSheetRef>(null);
  const clusterSheetRef = React.useRef<ActionSheetRef>(null);

  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null,
  );
  const [clusterUsers, setClusterUsers] = React.useState<NearbyUser[] | null>(
    null,
  );
  const [markerImages, setMarkerImages] = React.useState<
    Record<string, string>
  >({});
  const [unclusteredIds, setUnclusteredIds] =
    React.useState<Set<string> | null>(null);
  const isAndroid = Platform.OS === "android";

  service.attachRefs(mapRef, superCluster);

  React.useEffect(() => {
    service.attachRefs(mapRef, superCluster);
    return () => service.destroy();
  }, [service]);

  const handleMarkerCapture = React.useCallback(
    (id: string, uri: string) => {
      service.queueMarkerCapture(id, uri, (batch) => {
        setMarkerImages((prev) => service.mergeMarkerImages(prev, batch));
      });
    },
    [service],
  );

  const nearbyUsersAndMyself = React.useMemo(
    () =>
      service.buildNearbyUsersAndMyself(
        nearbyUsers,
        currentUser?.id,
        latitude,
        longitude,
      ),
    [service, nearbyUsers, currentUser?.id, latitude, longitude],
  );

  React.useEffect(() => {
    if (!isAndroid) return;
    setMarkerImages((prev) =>
      service.pruneMarkerImages(prev, nearbyUsersAndMyself),
    );
  }, [isAndroid, nearbyUsersAndMyself, service]);

  const handleMarkerPress = (userId: string) => {
    const nearbyUser = nearbyUsersById[userId];
    if (nearbyUser) {
      setSelectedUser(service.enrichUser(nearbyUser, usersById));
      clusterSheetRef.current?.hide();
      singleUserSheetRef.current?.show();
    }
  };

  const handleClusterPress = (users: NearbyUser[] | null) => {
    const action = service.resolveClusterAction(
      users,
      currentUser?.id,
      usersById,
    );
    if (action.type === "none") return;

    if (action.type === "single") {
      handleMarkerPress(action.user.userId);
      return;
    }

    singleUserSheetRef.current?.hide();
    setClusterUsers(action.users);
    clusterSheetRef.current?.show();
  };

  const handleSelectUserFromCluster = (nearbyUser: NearbyUser) => {
    setSelectedUser(service.enrichUser(nearbyUser, usersById));
    clusterSheetRef.current?.hide();
    setTimeout(() => {
      singleUserSheetRef.current?.show();
    }, 200);
  };

  const handleShowOnMap = (targetLat: number, targetLng: number) => {
    setTimeout(() => {
      service.animateTo(targetLat, targetLng, 0.003, 600);
    }, 150);
  };

  const handleSingleSheetClose = () => {
    setSelectedUser(null);
  };

  const handleMarkersChange = React.useCallback(
    (markers: any[] = []) => {
      const updated = service.updateUnclusteredIds(markers);
      if (updated) {
        setUnclusteredIds(updated);
      }
    },
    [service],
  );

  const resolvePulsePoints = React.useCallback(
    () => service.resolvePulsePoints(nearbyUsersAndMyself),
    [service, nearbyUsersAndMyself],
  );

  const androidPulse = usePulseAnimation({
    active: isAndroid && isActive,
    maxOpacity: 0.75,
    resolvePoints: isAndroid && isActive ? resolvePulsePoints : undefined,
  });
  const { pause: pauseAndroidPulse, resume: resumeAndroidPulse } = androidPulse;

  const handleRegionChange = React.useCallback(
    (region: Region) => {
      service.setCurrentRegion(region);
      pauseAndroidPulse();
    },
    [service, pauseAndroidPulse],
  );

  const handleRegionChangeComplete = React.useCallback(
    (region: Region) => {
      service.setCurrentRegion(region);
      resumeAndroidPulse();
    },
    [service, resumeAndroidPulse],
  );

  const markerCaptureItems = React.useMemo(() => {
    if (!isAndroid) return [];
    const targetUsers = unclusteredIds
      ? nearbyUsersAndMyself.filter((u) => unclusteredIds.has(u.userId))
      : nearbyUsersAndMyself;

    return targetUsers.map((u) => {
      const storeUser = usersById[u.userId];
      const isSelf = u.userId === currentUser?.id;
      return {
        id: u.userId,
        captureKey: `${u.isOnline ? 1 : 0}-${isSelf ? 1 : 0}-${showUsernames ? 1 : 0}-${storeUser?.pictureId ?? ""}-${storeUser?.username ?? ""}`,
        content: (
          <UserMarker
            userId={u.userId}
            isOnline={u.isOnline}
            isCurrentUser={isSelf}
            animatePulse={false}
          />
        ),
      };
    });
  }, [
    isAndroid,
    unclusteredIds,
    nearbyUsersAndMyself,
    usersById,
    currentUser?.id,
    showUsernames,
  ]);

  if (!currentUser || isPending) return <ActivityIndicator />;

  return (
    <View className={cn("flex-1", className)}>
      <MarkerCaptureLayer
        items={markerCaptureItems}
        onCapture={handleMarkerCapture}
      />

      <MapView
        key={`${colorScheme}`}
        ref={mapRef}
        superClusterRef={superCluster}
        style={{ flex: 1, ...style }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={
          colorScheme === "dark" ? AndroidDarkMapStyle : undefined
        }
        onMapReady={() => {
          service.attachRefs(mapRef, superCluster);
          androidPulse.syncPoints();
        }}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMarkersChange={handleMarkersChange}
        showsCompass={false}
        mapType={mapMode === "map" ? "standard" : "satellite"}
        clusteringEnabled={true}
        renderCluster={(cluster) => {
          const { geometry, properties } = cluster;
          const clusterLat = geometry.coordinates[1];
          const clusterLng = geometry.coordinates[0];
          const { previewUsers, currentUserIncluded } =
            service.resolveClusterPreview(
              cluster,
              currentUser?.id,
              nearbyUsersById,
              usersById,
            );

          return (
            <UsersMarker
              key={cluster.id}
              nearbyUsers={previewUsers}
              totalCount={properties.point_count}
              currentUserIncluded={currentUserIncluded}
              latitude={clusterLat}
              longitude={clusterLng}
              onPress={() =>
                handleClusterPress(
                  service.resolveFullClusterUsers(
                    cluster,
                    nearbyUsersAndMyself,
                    usersById,
                  ),
                )
              }
            />
          );
        }}
      >
        {nearbyUsersAndMyself.map((u) => (
          <Marker
            key={u.userId}
            id={u.userId}
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{ latitude: u.latitude!, longitude: u.longitude! }}
            onPress={() => {
              if (u.userId !== currentUser?.id) handleMarkerPress(u.userId);
            }}
            tracksViewChanges={false}
            image={
              isAndroid && markerImages[u.userId]
                ? { uri: markerImages[u.userId] }
                : undefined
            }
          >
            {!isAndroid && (
              <UserMarker
                userId={u.userId}
                isOnline={u.isOnline}
                isCurrentUser={u.userId === currentUser?.id}
                animatePulse={isActive}
              />
            )}
          </Marker>
        ))}
      </MapView>

      <AndroidPulseOverlay
        points={androidPulse.points}
        scale={androidPulse.scale}
        opacity={androidPulse.opacity}
        visible={isActive && !androidPulse.isPaused}
        yOffset={showUsernames ? -14 : 0}
      />

      <SingleUserSheet
        ref={singleUserSheetRef}
        user={selectedUser}
        onShowOnMap={handleShowOnMap}
        onClose={handleSingleSheetClose}
      />

      <ActionSheet
        ref={clusterSheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.45}
        onClose={() => setClusterUsers(null)}
        containerStyle={{
          backgroundColor: palette.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, isLandscape ? 16 : 24),
        }}
      >
        <UsersModalContent
          clusterUsers={clusterUsers}
          onSelectUser={handleSelectUserFromCluster}
          onClose={() => clusterSheetRef.current?.hide()}
        />
      </ActionSheet>

      {nearbyUsers.length > 0 && (
        <View
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl",
            isLandscape ? "py-2" : "py-4",
          )}
          style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
        >
          <UsersCarousel
            users={nearbyUsers}
            className="rounded-full"
            onUserPress={(nearbyUser: NearbyUser) => {
              setSelectedUser(service.enrichUser(nearbyUser, usersById));
              clusterSheetRef.current?.hide();
              singleUserSheetRef.current?.show();
            }}
          />
        </View>
      )}

      <MapModes
        moveToCurrentLocation={() =>
          service.animateTo(latitude, longitude, 0.0002, 1000)
        }
      />
    </View>
  );
};
