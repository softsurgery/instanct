import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket, type Socket } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useLiveGeolocationParameters } from "./useLiveGeolocationParamters";

const MIN_MOVEMENT_METERS = 5;
const HEARTBEAT_INTERVAL_MS = 30_000;

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
  if (isUpdatingLocation && !force) return;
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

    useMapStore.getState().set("location", pos);

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

  if (!locationInterval) {
    const updateInterval =
      (useMapStore.getState().parameters?.updateInterval ?? 5) * 1000;
    locationInterval = setInterval(
      () => void performLocationUpdate(),
      updateInterval,
    );
  }
}

function stopGeolocation(): void {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
  if (sharedSocket) {
    disconnectSocket("geolocation");
    sharedSocket = null;
    listenersAttached = false;
  }
  lastEmittedPos = null;
  isUpdatingLocation = false;
}

interface UseLiveGeolocationOptions {
  enabled?: boolean;
  join?: string[];
}

export function useLiveGeolocation(
  { enabled = true, join = [] }: UseLiveGeolocationOptions = {
    enabled: true,
    join: [],
  },
) {
  const { refetchMapConfiguration } = useLiveGeolocationParameters();
  const { accessToken } = useAuthPersistStore();

  const connected = useMapStore((s) => s.connected);
  const loading = useMapStore((s) => s.loading);
  const reconnection = useMapStore((s) => s.reconnection);
  const location = useMapStore((s) => s.location);
  const restartSignal = useMapStore((s) => s.restartSignal);
  const hasInitializedParameters = useMapStore(
    (s) => s.hasInitializedParameters,
  );

  const nearbyUsers = useMapStore(useShallow((s) => s.nearbyUsers));
  const users = useMapStore(useShallow((s) => s.users));

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

  React.useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && sharedSocket?.connected) {
        void performLocationUpdate(true);
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, []);

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
