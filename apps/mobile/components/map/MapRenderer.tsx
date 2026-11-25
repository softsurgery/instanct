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
  const nearbyUsers = useMapStore(useShallow((s) => s.nearbyUsers));
  const users = useMapStore(useShallow((s) => s.users));
  const showUsernames = useMapStore((s) => s.settings.showUsernames);
  const mapMode = useMapStore((s) => s.settings.mode);
  const { isPending } = useLiveGeolocationParameters();
  const { palette } = useColorPalette();

  const singleUserSheetRef = React.useRef<ActionSheetRef>(null);
  const clusterSheetRef = React.useRef<ActionSheetRef>(null);
  const prevRegionRef = React.useRef<Region | null>(null);
  const currentRegionRef = React.useRef<Region | null>(null);

  //states
  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null,
  );
  const [clusterUsers, setClusterUsers] = React.useState<NearbyUser[] | null>(
    null,
  );

  // Android marker image capture state
  const [markerImages, setMarkerImages] = React.useState<
    Record<string, string>
  >({});
  const isAndroid = Platform.OS === "android";

  const handleMarkerCapture = React.useCallback((id: string, uri: string) => {
    setMarkerImages((prev) =>
      prev[id] === uri ? prev : { ...prev, [id]: uri },
    );
  }, []);

  const nearbyUsersAndMyself = React.useMemo(() => {
    const myself: NearbyUser = {
      latitude,
      longitude,
      userId: currentUser?.id as string,
      distance: 0,
      isOnline: true,
      coordinatesVisible: true,
      profilePicture: null,
      updatedAt: "",
    };
    // Only show users with visible coordinates on the map
    const visibleUsers = nearbyUsers.filter(
      (u) => u.coordinatesVisible && u.latitude != null && u.longitude != null,
    );
    return [...visibleUsers, myself];
  }, [currentUser?.id, nearbyUsers, latitude, longitude]);

  //handle marker press
  const handleMarkerPress = (
    latitude: number,
    longitude: number,
    userId: string,
  ) => {
    if (currentRegionRef.current) {
      prevRegionRef.current = currentRegionRef.current;
    }

    if (mapRef.current) {
      //@ts-ignore
      mapRef.current.animateToRegion(
        {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0002,
          longitudeDelta: 0.0002,
        },
        1000,
      );
    }

    const nearbyUser = nearbyUsers.find((u) => u.userId === userId);
    const user = users.find((u) => u.id === userId);
    if (nearbyUser) {
      setSelectedUser({ ...nearbyUser, user: user ?? nearbyUser.user });
      clusterSheetRef.current?.hide();
      singleUserSheetRef.current?.show();
    }
  };

  const handleMoveToCurrentLocation = () => {
    if (mapRef.current) {
      //@ts-ignore
      mapRef.current.animateToRegion(
        {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0002,
          longitudeDelta: 0.0002,
        },
        1000,
      );
    }
  };

  const handleClusterPress = (nearbyUser: NearbyUser[] | null) => {
    if (!nearbyUser || nearbyUser.length === 0) return;

    const unique = Array.from(
      new Map(nearbyUser.map((u) => [u.userId, u])).values(),
    );

    if (unique.length === 1 && unique[0].userId !== currentUser?.id) {
      if (unique[0].latitude != null && unique[0].longitude != null) {
        handleMarkerPress(
          unique[0].latitude,
          unique[0].longitude,
          unique[0].userId,
        );
      }
      return;
    }

    singleUserSheetRef.current?.hide();
    setClusterUsers(
      unique
        .filter((u) => u.userId !== currentUser?.id)
        .map((u) => ({
          ...u,
          user: users.find((user) => user.id === u.userId) ?? u.user,
        }))
        .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0)),
    );
    clusterSheetRef.current?.show();
  };

  const handleSelectUserFromCluster = (nearbyUser: NearbyUser) => {
    const fullUser = users.find((u) => u.id === nearbyUser.userId);
    setSelectedUser({ ...nearbyUser, user: fullUser ?? nearbyUser.user });
    clusterSheetRef.current?.hide();
    setTimeout(() => {
      singleUserSheetRef.current?.show();
    }, 200);
  };

  const handleShowOnMap = (latitude: number, longitude: number) => {
    prevRegionRef.current = null;
    singleUserSheetRef.current?.hide();
    if (mapRef.current) {
      // @ts-ignore
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000,
      );
    }
  };

  const handleSingleSheetClose = () => {
    if (prevRegionRef.current && mapRef.current) {
      // @ts-ignore
      mapRef.current?.animateToRegion(prevRegionRef.current, 1000);
    }
    prevRegionRef.current = null;
    setSelectedUser(null);
  };

  const handleClusterSheetClose = () => {
    setClusterUsers(null);
  };

  const unclusteredIdsRef = React.useRef<Set<string> | null>(null);

  const handleMarkersChange = React.useCallback((markers: any[] = []) => {
    const ids = new Set<string>();
    for (const m of markers) {
      if (m?.properties?.point_count === 0 && m?.properties?.id) {
        ids.add(m.properties.id);
      }
    }
    unclusteredIdsRef.current = ids;
  }, []);

  const resolvePulsePoints = React.useCallback(async () => {
    const map = mapRef.current as any;
    if (!map || typeof map.pointForCoordinate !== "function") return [];

    const onlineUsers = nearbyUsersAndMyself.filter(
      (u) =>
        u.isOnline &&
        u.latitude != null &&
        u.longitude != null &&
        (unclusteredIdsRef.current === null ||
          unclusteredIdsRef.current.has(u.userId)),
    );

    return Promise.all(
      onlineUsers.map(async (u) => {
        const pt = await map.pointForCoordinate({
          latitude: u.latitude!,
          longitude: u.longitude!,
        });
        return { id: u.userId, x: pt.x, y: pt.y };
      }),
    );
  }, [nearbyUsersAndMyself]);

  const androidPulse = usePulseAnimation({
    active: isAndroid && isActive,
    maxOpacity: 0.75,
    resolvePoints: isAndroid && isActive ? resolvePulsePoints : undefined,
  });
  const { pause: pauseAndroidPulse, resume: resumeAndroidPulse } = androidPulse;

  const handleRegionChange = React.useCallback(
    (region: Region) => {
      currentRegionRef.current = region;
      pauseAndroidPulse();
    },
    [pauseAndroidPulse],
  );

  const handleRegionChangeComplete = React.useCallback(
    (region: Region) => {
      currentRegionRef.current = region;
      resumeAndroidPulse();
    },
    [resumeAndroidPulse],
  );

  const markerCaptureItems = React.useMemo(() => {
    if (!isAndroid) return [];
    return nearbyUsersAndMyself.map((u) => {
      const storeUser = users.find((user) => user.id === u.userId);
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
  }, [isAndroid, nearbyUsersAndMyself, users, currentUser?.id, showUsernames]);

  if (!currentUser || isPending) return <ActivityIndicator />;

  return (
    <View className={cn("flex-1", className)}>
      {/* Android: offscreen capture layer for marker images */}
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
        onMapReady={androidPulse.syncPoints}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMarkersChange={handleMarkersChange}
        showsCompass={false}
        mapType={mapMode === "map" ? "standard" : "satellite"}
        clusteringEnabled={true}
        renderCluster={(cluster) => {
          const { geometry, properties } = cluster;
          const latitude = geometry.coordinates[1];
          const longitude = geometry.coordinates[0];

          // extract clustered userIds
          const clusterIds = properties.cluster_id
            ? superCluster.current?.getLeaves?.(cluster.id, Infinity)
            : [];

          const clusterMemberIds = new Set(
            clusterIds.map((c: any) => c.properties?.id),
          );
          const clusterNearbyUsers = nearbyUsersAndMyself
            .filter((u) => clusterMemberIds.has(u.userId))
            .map((nearbyUser) => ({
              ...nearbyUser,
              user: users.find((u) => nearbyUser.userId === u.id),
            }));

          return (
            <UsersMarker
              key={cluster.id}
              nearbyUsers={clusterNearbyUsers}
              currentUserIncluded={
                !!clusterNearbyUsers.find(
                  (u) => u.userId === (currentUser?.id as string),
                )
              }
              latitude={latitude}
              longitude={longitude}
              onPress={handleClusterPress}
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
              if (u.userId !== currentUser?.id)
                handleMarkerPress(u.latitude!, u.longitude!, u.userId);
            }}
            tracksViewChanges={false}
            image={
              isAndroid && markerImages[u.userId]
                ? { uri: markerImages[u.userId] }
                : undefined
            }
          >
            {/* iOS: render children directly; Android: children hidden, image prop used */}
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
      {/* Android: 60fps native-driver pulse overlay synced to map coordinates */}
      <AndroidPulseOverlay
        points={androidPulse.points}
        scale={androidPulse.scale}
        opacity={androidPulse.opacity}
        visible={isActive && !androidPulse.isPaused}
        yOffset={showUsernames ? -14 : 0}
      />
      {/* Single User Modal using ThreeDotsActionSheet */}
      <SingleUserSheet
        ref={singleUserSheetRef}
        user={selectedUser}
        onShowOnMap={handleShowOnMap}
        onClose={handleSingleSheetClose}
      />

      {/* Multiple Users Cluster Modal */}
      <ActionSheet
        ref={clusterSheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.45}
        onClose={handleClusterSheetClose}
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
              const fullUser = users.find((u) => u.id === nearbyUser.userId);
              setSelectedUser({
                ...nearbyUser,
                user: fullUser ?? nearbyUser.user,
              });
              clusterSheetRef.current?.hide();
              singleUserSheetRef.current?.show();
            }}
          />
        </View>
      )}
      {/* Navigation Mode */}
      <MapModes moveToCurrentLocation={handleMoveToCurrentLocation} />
    </View>
  );
};
