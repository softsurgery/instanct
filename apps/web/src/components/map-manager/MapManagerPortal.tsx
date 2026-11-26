import React from "react";
import dynamic from "next/dynamic";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@softsurgery/ui";
import { useBreadcrumb, useIntro, useUI } from "@softsurgery/contexts";
import { useDebounce } from "@softsurgery/lib";
import { Spinner } from "@softsurgery/components";
import { api } from "@/lib/api";
import { ResponseUserDto } from "@/types";
import {
  ExperimentalConnectedUserState,
  ServerErrorResponse,
  UpdateExperimentalGeolocationFlagsDto,
} from "api-client";
import type {
  LeafletMapItem,
  LeafletMapProps,
} from "@softsurgery/map-materials/web";
import { UserMapMarker } from "./UserMapMarker";
import { UserClusterMapMarker } from "./UserClusterMapMarker";
import { GlobalConfigurationForm } from "./GlobalConfigurationForm";
import { buildUnifiedUserList, UnifiedUsersPanel } from "./UnifiedUsersPanel";

type MapUserItem = ExperimentalConnectedUserState & LeafletMapItem;

const MapManagerMap = dynamic(
  () => import("@softsurgery/map-materials/web").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <Spinner />
      </div>
    ),
  },
) as <T extends LeafletMapItem>(
  props: LeafletMapProps<T>,
) => React.ReactElement | null;

export const MapManagerPortal = () => {
  const queryClient = useQueryClient();
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { clearIntro } = useIntro();
  const {
    setEnableMainOverflow,
    clearEnableMainOverflow,
    setEnableContainer,
    clearEnableContainer,
    setRootClassName,
    clearRootClassName,
  } = useUI();

  React.useEffect(() => {
    setRoutes?.([
      {
        title: "Map Manager",
        href: "/map-manager",
      },
    ]);
    clearIntro?.();
    setEnableContainer?.(false);
    setEnableMainOverflow?.(false);
    setRootClassName?.("p-0 gap-0");
    return () => {
      clearRoutes?.();
      clearEnableContainer?.();
      clearEnableMainOverflow?.();
      clearRootClassName?.();
    };
  }, [
    setRoutes,
    clearRoutes,
    clearIntro,
    setEnableContainer,
    clearEnableContainer,
    setEnableMainOverflow,
    clearEnableMainOverflow,
    setRootClassName,
    clearRootClassName,
  ]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const { value: debouncedSearch } = useDebounce<string>(searchTerm, 300);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null,
  );
  const [placingUserId, setPlacingUserId] = React.useState<string | null>(null);
  const [draggingUserId, setDraggingUserId] = React.useState<string | null>(
    null,
  );
  const [focusCoords, setFocusCoords] = React.useState<{
    latitude: number;
    longitude: number;
    nonce: number;
  } | null>(null);
  const mapCenterRef = React.useRef<{ latitude: number; longitude: number }>({
    latitude: 48.8566,
    longitude: 2.3522,
  });

  const { data: experimentalState, isLoading: isStateLoading } = useQuery({
    queryKey: ["experimental-geolocation"],
    queryFn: () => api.admin.experimentalGeolocation.getState(),
    refetchInterval: (query) =>
      query.state.data?.includeConnectedUsers ? 10000 : false,
  });

  const trimmedSearch = debouncedSearch.trim();

  const { data: usersResponse, isFetching: isUsersFetching } = useQuery({
    queryKey: ["map-manager-users", trimmedSearch],
    queryFn: () =>
      api.admin.user.findPaginated({
        page: "1",
        limit: "20",
        sort: "username,ASC",
        search: trimmedSearch,
      }),
    enabled: trimmedSearch.length > 0,
  });

  const connectedUsers = React.useMemo(
    () => experimentalState?.connectedUsers ?? [],
    [experimentalState],
  );

  const pictureQueries = useQueries({
    queries: connectedUsers.map((u) => ({
      queryKey: ["profile-picture", u.user?.pictureId],
      queryFn: () => api.upload.getUploadById(u.user!.pictureId!),
      enabled: !!u.user?.pictureId,
      staleTime: Infinity,
    })),
  });

  const pictureUrlsByUserId = React.useMemo(() => {
    const map = new Map<string, string>();
    connectedUsers.forEach((u, index) => {
      const url = pictureQueries[index]?.data;
      if (url) {
        map.set(u.userId, url);
      }
    });
    return map;
  }, [connectedUsers, pictureQueries]);

  const mapItems: MapUserItem[] = React.useMemo(
    () => connectedUsers.map((u) => ({ ...u, id: u.userId })),
    [connectedUsers],
  );

  const connectedByUserId = React.useMemo(() => {
    const map = new Map<string, ExperimentalConnectedUserState>();
    for (const item of connectedUsers) {
      map.set(item.userId, item);
    }
    return map;
  }, [connectedUsers]);

  const { mutate: updateFlags, isPending: isUpdatingFlags } = useMutation({
    mutationFn: (dto: UpdateExperimentalGeolocationFlagsDto) =>
      api.admin.experimentalGeolocation.updateFlags(dto),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["experimental-geolocation"] });
      if (variables.positionsVisibleToEveryone !== undefined) {
        toast.success(
          res.positionsVisibleToEveryone
            ? "Positions are now visible to everyone in the app"
            : "Positions now require an accepted request",
        );
      } else if (variables.includeConnectedUsers !== undefined) {
        toast.success(
          res.includeConnectedUsers
            ? "Connected map users are now shown and broadcast"
            : "Only experimental test users are shown",
        );
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(err?.message || "Failed to update visibility flag");
    },
  });

  const { mutate: connectUser, isPending: isConnecting } = useMutation({
    mutationFn: ({
      userId,
      latitude,
      longitude,
    }: {
      userId: string;
      latitude?: number;
      longitude?: number;
    }) =>
      api.admin.experimentalGeolocation.connectUser(userId, {
        latitude,
        longitude,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["experimental-geolocation"] });
      setSelectedUserId(res.userId);
      if (res.latitude == null || res.longitude == null) {
        setPlacingUserId(res.userId);
        toast.success(
          "User connected — click on the map to place their position",
        );
      } else {
        setFocusCoords({
          latitude: res.latitude,
          longitude: res.longitude,
          nonce: Date.now(),
        });
        toast.success("User connected on map");
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(err?.message || "Failed to connect user");
    },
  });

  const { mutate: disconnectUser, isPending: isDisconnecting } = useMutation({
    mutationFn: (userId: string) =>
      api.admin.experimentalGeolocation.disconnectUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["experimental-geolocation"] });
      if (placingUserId === userId) setPlacingUserId(null);
      if (selectedUserId === userId) setSelectedUserId(null);
      toast.success("User disconnected from map");
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(err?.message || "Failed to disconnect user");
    },
  });

  const { mutate: updateLocation } = useMutation({
    mutationFn: ({
      userId,
      latitude,
      longitude,
    }: {
      userId: string;
      latitude: number;
      longitude: number;
    }) =>
      api.admin.experimentalGeolocation.updateUserLocation(userId, {
        latitude,
        longitude,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experimental-geolocation"] });
      setPlacingUserId(null);
      toast.success("User position updated on map");
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(err?.message || "Failed to update user position");
    },
  });

  const handleMapClick = React.useCallback(
    (latitude: number, longitude: number) => {
      if (!placingUserId) return;
      updateLocation({ userId: placingUserId, latitude, longitude });
    },
    [placingUserId, updateLocation],
  );

  const handleMapDrop = React.useCallback(
    (
      latitude: number,
      longitude: number,
      event: React.DragEvent<HTMLDivElement>,
    ) => {
      const droppedUserId =
        event.dataTransfer.getData("text/plain") || draggingUserId;
      setDraggingUserId(null);
      if (!droppedUserId) return;

      setSelectedUserId(droppedUserId);
      setPlacingUserId(null);

      if (connectedByUserId.has(droppedUserId)) {
        updateLocation({ userId: droppedUserId, latitude, longitude });
      } else {
        connectUser({ userId: droppedUserId, latitude, longitude });
      }
    },
    [connectedByUserId, connectUser, draggingUserId, updateLocation],
  );

  const systemUsers: ResponseUserDto[] = React.useMemo(
    () => (trimmedSearch ? (usersResponse?.data ?? []) : []),
    [trimmedSearch, usersResponse],
  );

  const experimentalConnectedUsers = React.useMemo(
    () => connectedUsers.filter((u) => u.isExperimental !== false),
    [connectedUsers],
  );

  const unifiedUsers = React.useMemo(
    () =>
      buildUnifiedUserList(
        experimentalConnectedUsers,
        systemUsers,
        connectedByUserId,
        Boolean(trimmedSearch),
      ),
    [experimentalConnectedUsers, systemUsers, connectedByUserId, trimmedSearch],
  );

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="72%" minSize="40%">
          <div className="relative h-full w-full">
            <MapManagerMap
              items={mapItems}
              cursor={placingUserId ? "crosshair" : undefined}
              focusCoords={focusCoords}
              renderMarker={(item, { isDark }) => (
                <UserMapMarker
                  item={item}
                  pictureUrl={pictureUrlsByUserId.get(item.userId)}
                  isSelected={item.userId === selectedUserId}
                  isPlacing={item.userId === placingUserId}
                  isDark={isDark}
                />
              )}
              renderCluster={(items, { isDark }) => (
                <UserClusterMapMarker
                  items={items}
                  pictureUrlsByUserId={pictureUrlsByUserId}
                  selectedUserId={selectedUserId}
                  isDark={isDark}
                />
              )}
              onItemClick={(item) => setSelectedUserId(item.userId)}
              onClusterClick={(items, { fitBounds, zoom }) => {
                if (zoom < 18) {
                  fitBounds();
                } else if (items[0]) {
                  setSelectedUserId(items[0].userId);
                }
              }}
              onMapClick={handleMapClick}
              onMapDrop={handleMapDrop}
              onCenterChange={(latitude, longitude) => {
                mapCenterRef.current = { latitude, longitude };
              }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="28%" minSize="280px" maxSize="50%">
          <aside className="flex h-full w-full flex-col bg-background">
            <Tabs
              defaultValue="users"
              className="flex h-full min-h-0 flex-1 flex-col gap-0"
            >
              <div className="border-b px-4 py-2.5">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="configuration">
                    Global Configuration
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="users"
                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <UnifiedUsersPanel
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  hasSearch={Boolean(trimmedSearch)}
                  items={unifiedUsers}
                  isLoading={isStateLoading || isUsersFetching}
                  isConnecting={isConnecting}
                  isDisconnecting={isDisconnecting}
                  selectedUserId={selectedUserId}
                  onSelectUser={(item) => {
                    setSelectedUserId(item.id);
                    if (
                      item.state?.latitude != null &&
                      item.state?.longitude != null
                    ) {
                      setFocusCoords({
                        latitude: item.state.latitude,
                        longitude: item.state.longitude,
                        nonce: Date.now(),
                      });
                    }
                  }}
                  onConnectUser={(userId) =>
                    connectUser({
                      userId,
                      latitude: mapCenterRef.current.latitude,
                      longitude: mapCenterRef.current.longitude,
                    })
                  }
                  onDisconnectUser={(userId) => disconnectUser(userId)}
                  onDragStartUser={(userId) => setDraggingUserId(userId)}
                  onDragEndUser={() => setDraggingUserId(null)}
                />
              </TabsContent>

              <TabsContent
                value="configuration"
                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <GlobalConfigurationForm
                  positionsVisibleToEveryone={Boolean(
                    experimentalState?.positionsVisibleToEveryone,
                  )}
                  includeConnectedUsers={Boolean(
                    experimentalState?.includeConnectedUsers,
                  )}
                  disabled={isStateLoading || isUpdatingFlags}
                  onPositionsVisibleChange={(checked) =>
                    updateFlags({ positionsVisibleToEveryone: checked })
                  }
                  onIncludeConnectedUsersChange={(checked) =>
                    updateFlags({ includeConnectedUsers: checked })
                  }
                />
              </TabsContent>
            </Tabs>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
