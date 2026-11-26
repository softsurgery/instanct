import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@softsurgery/ui";
import { SearchInput, Spinner } from "@softsurgery/components";
import { identifyUser, identifyUserAvatar } from "@softsurgery/lib";
import { api } from "@/lib/api";
import type { ResponseUserDto } from "@/types";
import type { ExperimentalConnectedUserState } from "api-client";
import { ExternalLink, Plus, X } from "lucide-react";
import { PegmanIcon } from "@softsurgery/map-materials/web";

export interface UnifiedUserListItem {
  id: string;
  label: string;
  fallback: string;
  email?: string;
  pictureId?: number;
  state?: ExperimentalConnectedUserState;
}

interface UnifiedUsersPanelProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  hasSearch: boolean;
  items: UnifiedUserListItem[];
  isLoading: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  selectedUserId: string | null;
  onSelectUser: (item: UnifiedUserListItem) => void;
  onConnectUser: (userId: string) => void;
  onDisconnectUser: (userId: string) => void;
  onDragStartUser: (userId: string) => void;
  onDragEndUser: () => void;
}

export function buildUnifiedUserList(
  connectedUsers: ExperimentalConnectedUserState[],
  systemUsers: ResponseUserDto[],
  connectedByUserId: Map<string, ExperimentalConnectedUserState>,
  hasSearch: boolean,
): UnifiedUserListItem[] {
  if (!hasSearch) {
    return connectedUsers.map((connected) => ({
      id: connected.userId,
      label: connected.user ? identifyUser(connected.user) : connected.userId,
      fallback: identifyUserAvatar(connected.user),
      email: connected.user?.email,
      pictureId: connected.user?.pictureId,
      state: connected,
    }));
  }

  return systemUsers.map((user) => {
    const state = connectedByUserId.get(user.id);
    return {
      id: user.id,
      label: identifyUser(user),
      fallback: identifyUserAvatar(user),
      email: user.email,
      pictureId: user.pictureId,
      state: state?.isExperimental !== false ? state : undefined,
    };
  });
}

const UserListAvatar: React.FC<{
  pictureId?: number;
  fallback: string;
  alt: string;
}> = ({ pictureId, fallback, alt }) => {
  const { data: url } = useQuery({
    queryKey: ["profile-picture", pictureId],
    queryFn: () => api.upload.getUploadById(pictureId!),
    enabled: !!pictureId,
    staleTime: Infinity,
  });

  return (
    <Avatar className="h-10 w-10 shrink-0 border border-border">
      <AvatarImage src={url} alt={alt} className="object-cover" />
      <AvatarFallback className="text-xs font-semibold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};

export const UnifiedUsersPanel: React.FC<UnifiedUsersPanelProps> = ({
  searchTerm,
  onSearchTermChange,
  hasSearch,
  items,
  isLoading,
  isConnecting,
  isDisconnecting,
  selectedUserId,
  onSelectUser,
  onConnectUser,
  onDisconnectUser,
  onDragStartUser,
  onDragEndUser,
}) => {
  const selectedItems = React.useMemo(
    () => (hasSearch ? items.filter((item) => Boolean(item.state)) : items),
    [hasSearch, items],
  );

  const unselectedItems = React.useMemo(
    () => (hasSearch ? items.filter((item) => !item.state) : []),
    [hasSearch, items],
  );

  const renderUserRow = (item: UnifiedUserListItem) => {
    const isSelected = item.id === selectedUserId;

    return (
      <div
        key={item.id}
        onClick={() => onSelectUser(item)}
        className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-muted/40"
        }`}
      >
        <UserListAvatar
          pictureId={item.pictureId}
          fallback={item.fallback}
          alt={item.label}
        />

        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-xs font-medium">{item.label}</div>
          {item.email && (
            <div className="truncate text-[11px] text-muted-foreground">
              {item.email}
            </div>
          )}
        </div>

        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("text/plain", item.id);
              e.dataTransfer.effectAllowed = "move";
              onDragStartUser(item.id);
            }}
            onDragEnd={() => onDragEndUser()}
            title="Drag onto map"
            className="cursor-grab p-0.5 transition-transform hover:scale-110 active:cursor-grabbing"
          >
            <PegmanIcon size={26} />
          </div>

          <Link
            href={`/user-management/users/${item.id}`}
            title="Open user profile"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>

          {item.state ? (
            <X
              onClick={() => {
                if (!isDisconnecting) onDisconnectUser(item.id);
              }}
              className={`h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-destructive ${
                isDisconnecting ? "pointer-events-none opacity-50" : ""
              }`}
            />
          ) : (
            <Plus
              onClick={() => {
                if (!isConnecting) onConnectUser(item.id);
              }}
              className={`h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground ${
                isConnecting ? "pointer-events-none opacity-50" : ""
              }`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3">
      <SearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder="Search users..."
        containerClassName="mb-2"
      />

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            {hasSearch
              ? "No matching users found."
              : "Search above to find and place a user."}
          </div>
        ) : hasSearch ? (
          <div className="space-y-3">
            {selectedItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected ({selectedItems.length})
                </div>
                {selectedItems.map(renderUserRow)}
              </div>
            )}
            {unselectedItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Not Selected ({unselectedItems.length})
                </div>
                {unselectedItems.map(renderUserRow)}
              </div>
            )}
          </div>
        ) : (
          selectedItems.map(renderUserRow)
        )}
      </div>
    </div>
  );
};
