import type React from "react";
import type MapView from "react-native-map-clustering";
import type { Region } from "react-native-maps";
import type { NearbyUser } from "@/types";
import type { ResponseUserDto } from "api-client";

export interface PulsePoint {
  id: string;
  x: number;
  y: number;
}

export class MapRendererService {
  private mapRef: React.RefObject<MapView | null> | null = null;
  private superClusterRef: React.RefObject<any> | null = null;
  private currentRegion: Region | null = null;
  private prevRegion: Region | null = null;
  private unclusteredIds: Set<string> | null = null;
  private pendingCaptures: Record<string, string> = {};
  private captureFlushTimer: ReturnType<typeof setTimeout> | null = null;

  /** Binds the MapView and SuperCluster refs to the service. */
  attachRefs(
    mapRef: React.RefObject<MapView | null>,
    superClusterRef: React.RefObject<any>,
  ): void {
    this.mapRef = mapRef;
    this.superClusterRef = superClusterRef;
  }

  /** Clears pending timers and releases ref references on unmount. */
  destroy(): void {
    if (this.captureFlushTimer) {
      clearTimeout(this.captureFlushTimer);
      this.captureFlushTimer = null;
    }
    this.pendingCaptures = {};
    this.mapRef = null;
    this.superClusterRef = null;
  }

  /** Updates the latest visible map region. */
  setCurrentRegion(region: Region): void {
    this.currentRegion = region;
  }

  /** Snapshots the current region so it can be restored when a sheet closes. */
  savePreviousRegion(): void {
    if (this.currentRegion) {
      this.prevRegion = this.currentRegion;
    }
  }

  /** Discards any saved previous region snapshot. */
  clearPreviousRegion(): void {
    this.prevRegion = null;
  }

  /** Animates the map back to the previously saved region, if any. */
  restorePreviousRegion(duration = 1000): void {
    const map = this.mapRef?.current;
    if (this.prevRegion && map) {
      // @ts-ignore
      map.animateToRegion(this.prevRegion, duration);
    }
    this.prevRegion = null;
  }

  /** Animates the map camera to the given coordinates and zoom delta. */
  animateTo(
    latitude: number,
    longitude: number,
    delta = 0.0002,
    duration = 1000,
  ): void {
    const map = this.mapRef?.current;
    if (!map) return;
    // @ts-ignore
    map.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      duration,
    );
  }

  /** Filters nearby users with visible coordinates and appends the current user. */
  buildNearbyUsersAndMyself(
    nearbyUsers: NearbyUser[],
    currentUserId: string | undefined,
    latitude: number,
    longitude: number,
  ): NearbyUser[] {
    const myself: NearbyUser = {
      latitude,
      longitude,
      userId: currentUserId as string,
      distance: 0,
      isOnline: true,
      coordinatesVisible: true,
      profilePicture: null,
      updatedAt: "",
    };

    const visibleUsers = nearbyUsers.filter(
      (u) => u.coordinatesVisible && u.latitude != null && u.longitude != null,
    );
    return [...visibleUsers, myself];
  }

  /** Attaches the full user profile from the store to a NearbyUser entry. */
  enrichUser(
    nearbyUser: NearbyUser,
    usersById: Record<string, ResponseUserDto>,
  ): NearbyUser {
    const fullUser = usersById[nearbyUser.userId];
    return {
      ...nearbyUser,
      user: fullUser ?? nearbyUser.user,
    };
  }

  /** Resolves up to 3 preview users and self-membership for a cluster marker. */
  resolveClusterPreview(
    cluster: { id: number | string; properties: { cluster_id?: number } },
    currentUserId: string | undefined,
    nearbyUsersById: Record<string, NearbyUser>,
    usersById: Record<string, ResponseUserDto>,
  ): { previewUsers: NearbyUser[]; currentUserIncluded: boolean } {
    const previewLeaves = cluster.properties.cluster_id
      ? (this.superClusterRef?.current?.getLeaves?.(cluster.id, 3) ?? [])
      : [];

    const previewUsers: NearbyUser[] = [];
    let currentUserIncluded = false;

    for (const leaf of previewLeaves) {
      const id = leaf.properties?.id as string | undefined;
      if (!id) continue;
      if (id === currentUserId) {
        currentUserIncluded = true;
        continue;
      }
      const nearbyUser = nearbyUsersById[id];
      if (nearbyUser) {
        previewUsers.push(this.enrichUser(nearbyUser, usersById));
      }
    }

    return { previewUsers, currentUserIncluded };
  }

  /** Resolves all enriched member users belonging to a pressed cluster. */
  resolveFullClusterUsers(
    cluster: { id: number | string; properties: { cluster_id?: number } },
    nearbyUsersAndMyself: NearbyUser[],
    usersById: Record<string, ResponseUserDto>,
  ): NearbyUser[] {
    const allLeaves = cluster.properties.cluster_id
      ? (this.superClusterRef?.current?.getLeaves?.(cluster.id, Infinity) ?? [])
      : [];
    const memberIds = new Set(allLeaves.map((c: any) => c.properties?.id));

    return nearbyUsersAndMyself
      .filter((u) => memberIds.has(u.userId))
      .map((u) => this.enrichUser(u, usersById));
  }

  /** Determines whether a cluster tap opens a single user sheet or a cluster list. */
  resolveClusterAction(
    nearbyUsers: NearbyUser[] | null,
    currentUserId: string | undefined,
    usersById: Record<string, ResponseUserDto>,
  ):
    | { type: "none" }
    | { type: "single"; user: NearbyUser }
    | { type: "cluster"; users: NearbyUser[] } {
    if (!nearbyUsers || nearbyUsers.length === 0) {
      return { type: "none" };
    }

    const unique = Array.from(
      new Map(nearbyUsers.map((u) => [u.userId, u])).values(),
    );

    if (unique.length === 1 && unique[0].userId !== currentUserId) {
      if (unique[0].latitude != null && unique[0].longitude != null) {
        return {
          type: "single",
          user: this.enrichUser(unique[0], usersById),
        };
      }
      return { type: "none" };
    }

    return {
      type: "cluster",
      users: unique
        .filter((u) => u.userId !== currentUserId)
        .map((u) => this.enrichUser(u, usersById))
        .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0)),
    };
  }

  /** Debounces and batches offscreen Android marker image captures into a single flush. */
  queueMarkerCapture(
    id: string,
    uri: string,
    onFlush: (batch: Record<string, string>) => void,
  ): void {
    this.pendingCaptures[id] = uri;
    if (this.captureFlushTimer) return;

    this.captureFlushTimer = setTimeout(() => {
      this.captureFlushTimer = null;
      const batch = this.pendingCaptures;
      this.pendingCaptures = {};
      onFlush(batch);
    }, 50);
  }

  /** Merges newly captured marker image URIs into state only when values changed. */
  mergeMarkerImages(
    prev: Record<string, string>,
    batch: Record<string, string>,
  ): Record<string, string> {
    let changed = false;
    for (const [k, v] of Object.entries(batch)) {
      if (prev[k] !== v) {
        changed = true;
        break;
      }
    }
    return changed ? { ...prev, ...batch } : prev;
  }

  /** Removes cached marker image URIs for users no longer present on the map. */
  pruneMarkerImages(
    prev: Record<string, string>,
    users: NearbyUser[],
  ): Record<string, string> {
    const activeIds = new Set(users.map((u) => u.userId));
    let hasStale = false;
    for (const id of Object.keys(prev)) {
      if (!activeIds.has(id)) {
        hasStale = true;
        break;
      }
    }
    if (!hasStale) return prev;

    const next: Record<string, string> = {};
    for (const [id, uri] of Object.entries(prev)) {
      if (activeIds.has(id)) next[id] = uri;
    }
    return next;
  }

  /** Extracts unclustered user IDs from cluster markers and returns the set if changed. */
  updateUnclusteredIds(markers: any[] = []): Set<string> | null {
    const ids = new Set<string>();
    for (const m of markers) {
      if (m?.properties?.point_count === 0 && m?.properties?.id) {
        ids.add(m.properties.id);
      }
    }

    const prev = this.unclusteredIds;
    if (prev && prev.size === ids.size) {
      let same = true;
      for (const id of ids) {
        if (!prev.has(id)) {
          same = false;
          break;
        }
      }
      if (same) return null;
    }

    this.unclusteredIds = ids;
    return ids;
  }

  /** Projects visible, unclustered online users to screen coordinates for Android pulse overlays. */
  async resolvePulsePoints(
    nearbyUsersAndMyself: NearbyUser[],
  ): Promise<PulsePoint[]> {
    const map = this.mapRef?.current as any;
    if (!map || typeof map.pointForCoordinate !== "function") return [];

    const region = this.currentRegion;
    const latMargin = region ? region.latitudeDelta * 0.6 : Infinity;
    const lonMargin = region ? region.longitudeDelta * 0.6 : Infinity;

    const onlineUsers = nearbyUsersAndMyself.filter((u) => {
      if (!u.isOnline || u.latitude == null || u.longitude == null) {
        return false;
      }
      if (this.unclusteredIds !== null && !this.unclusteredIds.has(u.userId)) {
        return false;
      }
      if (region) {
        if (
          Math.abs(u.latitude - region.latitude) > latMargin ||
          Math.abs(u.longitude - region.longitude) > lonMargin
        ) {
          return false;
        }
      }
      return true;
    });

    return Promise.all(
      onlineUsers.map(async (u) => {
        const pt = await map.pointForCoordinate({
          latitude: u.latitude!,
          longitude: u.longitude!,
        });
        return { id: u.userId, x: pt.x, y: pt.y };
      }),
    );
  }
}
