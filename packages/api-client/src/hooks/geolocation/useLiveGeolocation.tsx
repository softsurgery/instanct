import { disconnectSocket, getSocket, type Socket } from "@softsurgery/lib";
import * as Location from "expo-location";
import React from "react";
import {
  AppState,
  type AppStateStatus,
  type NativeEventSubscription,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useLiveGeolocationParameters } from "./useLiveGeolocationParamters";
import { useMapStore } from "../stores/useMapStore";
import { NearbyUser } from "../types/map";
import { useAuthPersistStore } from "@softsurgery/hooks";

const MIN_MOVEMENT_METERS = 5;
const HEARTBEAT_INTERVAL_MS = 30_000;
const EMPTY_NEARBY_USERS: NearbyUser[] = [];
const EMPTY_USERS: ReturnType<typeof useMapStore.getState>["users"] = [];
const DEFAULT_RECONNECTION = {
  reconnecting: false,
  reconnectAttempt: 0,
  reconnectDelay: 0,
};

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Module-level singleton state across components
let subscriberCount = 0;
let sharedSocket: Socket | null = null;
let locationInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;
let listenersAttached = false;
let isUpdatingLocation = false;
let lastEmittedPos: {
  latitude: number;
  longitude: number;
  timestamp: number;
} | null = null;

const activeJoins = new Set<string>([
  "user",
  "user.industries",
  "user.sessions",
]);

async function performLocationUpdate(force = false): Promise<void> {
  if (isUpdatingLocation) return;
  if (!sharedSocket?.connected) return;
  if (AppState.currentState !== "active" && !force) return;

  isUpdatingLocation = true;
  try {
    const radius = useMapStore.getState().settings?.radius ?? 50;

    // Fast path: load last known position immediately on startup so users render with zero lag
    const cachedLocation = useMapStore.getState().location;
    if (!cachedLocation) {
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && sharedSocket?.connected) {
          useMapStore.getState().set("location", lastKnown);
          sharedSocket.emit("update_location", {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            radius,
            query: { join: Array.from(activeJoins).join(",") },
          });
        }
      } catch {
        // Fall back to current position
      }
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const prevLoc = useMapStore.getState().location;
    const movedFromStore = prevLoc
      ? calculateDistanceMeters(
          prevLoc.coords.latitude,
          prevLoc.coords.longitude,
          pos.coords.latitude,
          pos.coords.longitude,
        )
      : Infinity;

    if (!prevLoc || movedFromStore >= MIN_MOVEMENT_METERS) {
      useMapStore.getState().set("location", pos);
    }

    const now = Date.now();
    const last = lastEmittedPos;
    if (last && !force) {
      const dist = calculateDistanceMeters(
        last.latitude,
        last.longitude,
        pos.coords.latitude,
        pos.coords.longitude,
      );
      const elapsed = now - last.timestamp;
      if (dist < MIN_MOVEMENT_METERS && elapsed < HEARTBEAT_INTERVAL_MS) {
        return;
      }
    }

    lastEmittedPos = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      timestamp: now,
    };

    if (sharedSocket?.connected) {
      sharedSocket.emit("update_location", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radius,
        query: { join: Array.from(activeJoins).join(",") },
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to fetch location:", err);
  } finally {
    isUpdatingLocation = false;
  }
}

function startLocationInterval(): void {
  if (locationInterval || AppState.currentState !== "active") return;
  const updateInterval =
    (useMapStore.getState().parameters?.updateInterval ?? 15) * 1000;
  locationInterval = setInterval(
    () => void performLocationUpdate(),
    updateInterval,
  );
}

function stopLocationInterval(): void {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
}

async function startGeolocation(accessToken?: string): Promise<void> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("❌ Location permission denied");
    return;
  }

  // Pre-seed location from lastKnown immediately so UI has coordinates right away
  try {
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown && !useMapStore.getState().location) {
      useMapStore.getState().set("location", lastKnown);
    }
  } catch {
    // Ignore
  }

  if (!sharedSocket) {
    sharedSocket = getSocket("geolocation", {
      token: accessToken,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
  }

  if (!listenersAttached && sharedSocket) {
    listenersAttached = true;

    sharedSocket.on("connect", async () => {
      const store = useMapStore.getState();
      sharedSocket?.emit("identify");
      store.set("connected", true);
      store.set("loading", false);
      store.set("reconnection", {
        reconnecting: false,
        reconnectAttempt: 0,
        reconnectDelay: 0,
      });

      // Emit immediately if location is already known (0ms delay for nearby users)
      const currentLoc =
        store.location ??
        (await Location.getLastKnownPositionAsync().catch(() => null));
      if (currentLoc && sharedSocket?.connected) {
        const radius = store.settings?.radius ?? 50;
        store.set("location", currentLoc);
        sharedSocket.emit("update_location", {
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          radius,
          query: { join: Array.from(activeJoins).join(",") },
        });
      }

      await performLocationUpdate(true);
    });

    sharedSocket.on("disconnect", () => {
      useMapStore.getState().set("connected", false);
    });

    sharedSocket.io.on("reconnect_attempt", (attempt: number) => {
      const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
      useMapStore.getState().set("reconnection", {
        reconnecting: true,
        reconnectAttempt: attempt,
        reconnectDelay: delay,
      });
    });

    sharedSocket.io.on("reconnect_failed", () => {
      console.warn("❌ Reconnect failed — will retry automatically");
      useMapStore.getState().setNested("reconnection.reconnecting", false);
    });

    sharedSocket.io.on("reconnect", async (attempt: number) => {
      const store = useMapStore.getState();
      store.set("connected", true);
      store.set("reconnection", {
        reconnecting: false,
        reconnectAttempt: attempt,
        reconnectDelay: 0,
      });
      await performLocationUpdate(true);
    });

    sharedSocket.on("nearby_users", async (nearbyList: NearbyUser[]) => {
      const store = useMapStore.getState();
      store.setNearbyUsers(nearbyList);

      for (const n of nearbyList) {
        try {
          if (n.user) store.addUser(n.user);
        } catch (e) {
          console.warn("Failed to fetch profile:", e);
        }
      }
    });

    sharedSocket.on("user_moved", async (data: NearbyUser) => {
      const store = useMapStore.getState();
      store.updateNearbyUser(data);

      const existing = store.getUserById(data.userId);
      try {
        if (!existing && data.user) store.addUser(data.user);
      } catch (e) {
        console.warn("❌ Failed retrieving user", e);
      }
    });

    sharedSocket.on(
      "user_presence_changed",
      (event: { userId: string; isConnected: boolean }) => {
        if (event?.userId) {
          useMapStore
            .getState()
            .updateNearbyUserPresence(event.userId, event.isConnected);
        }
      },
    );
  }

  // Trigger initial location check
  await performLocationUpdate(true);

  startLocationInterval();

  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          startLocationInterval();
          if (sharedSocket?.connected) {
            void performLocationUpdate(true);
          }
        } else {
          stopLocationInterval();
        }
      },
    );
  }
}

function stopGeolocation(): void {
  stopLocationInterval();
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  if (sharedSocket) {
    disconnectSocket("geolocation");
    sharedSocket = null;
    listenersAttached = false;
  }
  lastEmittedPos = null;
  isUpdatingLocation = false;
}

type GeolocationSubscription =
  | boolean
  | {
      users?: boolean;
      nearbyUsers?: boolean;
      location?: boolean;
      status?: boolean;
    };

interface UseLiveGeolocationOptions {
  enabled?: boolean;
  join?: string[];
  subscribe?: GeolocationSubscription;
}

export function useLiveGeolocation(
  { enabled = true, join = [], subscribe = true }: UseLiveGeolocationOptions = {
    enabled: true,
    join: [],
    subscribe: true,
  },
) {
  const { refetchMapConfiguration } = useLiveGeolocationParameters();
  const { accessToken } = useAuthPersistStore();

  const subStatus =
    typeof subscribe === "boolean" ? subscribe : (subscribe.status ?? false);
  const subLocation =
    typeof subscribe === "boolean" ? subscribe : (subscribe.location ?? false);
  const subNearbyUsers =
    typeof subscribe === "boolean"
      ? subscribe
      : (subscribe.nearbyUsers ?? false);
  const subUsers =
    typeof subscribe === "boolean" ? subscribe : (subscribe.users ?? false);

  const connected = useMapStore((s) => (subStatus ? s.connected : false));
  const loading = useMapStore((s) => (subStatus ? s.loading : false));
  const reconnection = useMapStore((s) =>
    subStatus ? s.reconnection : DEFAULT_RECONNECTION,
  );
  const location = useMapStore((s) => (subLocation ? s.location : null));
  const restartSignal = useMapStore((s) => s.restartSignal);

  const nearbyUsers = useMapStore(
    useShallow((s) => (subNearbyUsers ? s.nearbyUsers : EMPTY_NEARBY_USERS)),
  );
  const users = useMapStore(
    useShallow((s) => (subUsers ? s.users : EMPTY_USERS)),
  );

  React.useEffect(() => {
    if (join && join.length > 0) {
      join.forEach((j) => activeJoins.add(j));
    }
  }, [join]);

  React.useEffect(() => {
    if (!enabled) return;

    subscriberCount++;
    if (subscriberCount === 1) {
      void startGeolocation(accessToken);
    }

    return () => {
      subscriberCount--;
      if (subscriberCount <= 0) {
        subscriberCount = 0;
        stopGeolocation();
      }
    };
  }, [enabled, accessToken, restartSignal]);

  const restartSocket = React.useCallback(async () => {
    stopGeolocation();
    const store = useMapStore.getState();
    store.restart();
    store.triggerRestart();
    if (subscriberCount > 0) {
      await startGeolocation(accessToken);
    }
  }, [accessToken]);

  return {
    connected,
    loading,
    reconnection,
    nearbyUsers,
    users,
    location,
    restartSocket,
    refetchMapConfiguration,
  };
}
