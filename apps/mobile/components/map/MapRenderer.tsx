import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import _ from "lodash";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, Region } from "react-native-maps";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useColorPalette } from "@softsurgery/mobile-components";
import { MarkerCaptureLayer } from "./AndroidMarker";
import { UsersCarousel } from "./UserCarousel/UsersCarousel";
import { UserMarker } from "./UserMarker";
import { SingleUserSheet } from "./SingleUserSheet";
import { UsersMarker } from "./UsersMarker";
import { UsersModalContent } from "./UsersModalContent";
import { AndroidDarkMapStyle } from "./utils/AndroidDarkMapStyle";
import { useLiveGeolocationParameters } from "@/hooks/content/geolocation/useLiveGeolocationParamters";
import { MapModes } from "./MapModes";

interface MapRendererProps {
  className?: string;
  style?: Record<string, any>;
  latitude: number;
  longitude: number;
  nearbyUsers: NearbyUser[];
}

export const MapRenderer = ({
  className,
  style,
  latitude,
  longitude,
}: MapRendererProps) => {
  const { currentUser } = useCurrentUser();
  const { colorScheme } = useColorScheme();
  const mapRef = React.useRef<MapView>(null);
  const superCluster = React.useRef<any>(null);
  const mapStore = useMapStore();
  const { isPending } = useLiveGeolocationParameters();
  const { palette } = useColorPalette();

  const singleUserSheetRef = React.useRef<ActionSheetRef>(null);
  const clusterSheetRef = React.useRef<ActionSheetRef>(null);
  const prevRegionRef = React.useRef<Region | null>(null);

  //states
  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null,
  );
  const [clusterUsers, setClusterUsers] = React.useState<NearbyUser[] | null>(
    null,
  );
  const [currentRegion, setCurrentRegion] = React.useState<Region | null>(null);

  // Android marker image capture state
  const [markerImages, setMarkerImages] = React.useState<
    Record<string, string>
  >({});
  const isAndroid = Platform.OS === "android";

  const handleMarkerCapture = React.useCallback((id: string, uri: string) => {
    setMarkerImages((prev) => ({ ...prev, [id]: uri }));
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
      updatedAt: new Date().toISOString(),
    };
    // Only show users with visible coordinates on the map
    const visibleUsers = mapStore.nearbyUsers.filter(
      (u) => u.coordinatesVisible && u.latitude != null && u.longitude != null,
    );
    return [...visibleUsers, myself];
  }, [currentUser, mapStore.nearbyUsers, latitude, longitude]);

  //handle marker press
  const handleMarkerPress = (
    latitude: number,
    longitude: number,
    userId: string,
  ) => {
    if (currentRegion) {
      prevRegionRef.current = currentRegion;
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

    const nearbyUser = mapStore.nearbyUsers.find((u) => u.userId === userId);
    const user = mapStore.users.find((u) => u.id === userId);
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
          user: mapStore.users.find((user) => user.id === u.userId) ?? u.user,
        }))
        .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0)),
    );
    clusterSheetRef.current?.show();
  };

  const handleSelectUserFromCluster = (nearbyUser: NearbyUser) => {
    const fullUser = mapStore.users.find((u) => u.id === nearbyUser.userId);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRegionChange = React.useCallback(
    _.throttle((region: Region) => {
      setCurrentRegion(region);
    }, 250),
    [],
  );

  if (!currentUser || isPending) return <ActivityIndicator />;

  const markerCaptureItems = nearbyUsersAndMyself.map((u) => ({
    id: u.userId,
    content: (
      <UserMarker
        userId={u.userId}
        isOnline={u.isOnline}
        isCurrentUser={u.userId === currentUser?.id}
      />
    ),
  }));

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
        onRegionChange={handleRegionChange}
        showsCompass={false}
        mapType={mapStore.settings.mode === "map" ? "standard" : "satellite"}
        clusteringEnabled={true}
        renderCluster={(cluster) => {
          const { geometry, properties } = cluster;
          const latitude = geometry.coordinates[1];
          const longitude = geometry.coordinates[0];

          // extract clustered userIds
          const clusterIds = properties.cluster_id
            ? superCluster.current?.getLeaves?.(cluster.id, Infinity)
            : [];

          const nearbyUsers = nearbyUsersAndMyself
            .filter((u) =>
              clusterIds.map((c: any) => c.properties?.id).includes(u.userId),
            )
            .map((nearbyUser) => ({
              ...nearbyUser,
              user: mapStore.users.find((u) => nearbyUser.userId === u.id),
            }));

          return (
            <UsersMarker
              key={cluster.id}
              nearbyUsers={nearbyUsers}
              currentUserIncluded={
                !!nearbyUsers.find(
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
            tracksViewChanges={!isAndroid}
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
              />
            )}
          </Marker>
        ))}
      </MapView>
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
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        <UsersModalContent
          clusterUsers={clusterUsers}
          onSelectUser={handleSelectUserFromCluster}
          onClose={() => clusterSheetRef.current?.hide()}
        />
      </ActionSheet>
      {mapStore.nearbyUsers.length > 0 && (
        <View className="py-4 absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl">
          <UsersCarousel
            users={mapStore.nearbyUsers}
            className="rounded-full"
            onUserPress={(user) => {
              if (
                user.coordinatesVisible &&
                user.latitude != null &&
                user.longitude != null
              ) {
                handleMarkerPress(user.latitude, user.longitude, user.userId);
              }
            }}
          />
        </View>
      )}
      {/* Navigation Mode */}
      <MapModes moveToCurrentLocation={handleMoveToCurrentLocation} />
    </View>
  );
};
