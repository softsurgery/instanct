import React from "react";
import type { ExperimentalConnectedUserState } from "api-client";
import { cn, identifyUser, identifyUserAvatar } from "@softsurgery/lib";

interface UserClusterMapMarkerProps {
  items: ExperimentalConnectedUserState[];
  pictureUrlsByUserId?: Map<string, string>;
  selectedUserId: string | null;
  isDark: boolean;
}

const AVATAR_Z_INDEX = ["z-30", "z-20", "z-10"] as const;

export const UserClusterMapMarker = ({
  items,
  pictureUrlsByUserId,
  selectedUserId,
  isDark,
}: UserClusterMapMarkerProps) => {
  const displayUsers = items.slice(0, 3);
  const hasSelected = items.some((u) => u.userId === selectedUserId);

  return (
    <div className="flex cursor-pointer flex-col items-center">
      <div
        className={cn(
          "flex flex-row items-center justify-center",
          hasSelected && "drop-shadow-[0_0_6px_rgba(37,99,235,0.65)]",
        )}
      >
        {displayUsers.map((u, index) => {
          const initials = identifyUserAvatar(u.user);
          const pictureUrl = pictureUrlsByUserId?.get(u.userId);
          const spacingClass =
            index === 0 ? "" : items.length > 2 ? "-ml-3" : "ml-0.5";

          return (
            <div
              key={u.userId}
              className={cn(
                "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 text-[11px] font-bold text-white shadow-md",
                u.userId === selectedUserId
                  ? "bg-blue-600"
                  : u.isExperimental === false
                    ? "bg-cyan-600"
                    : "bg-green-600",
                isDark ? "border-slate-900" : "border-white",
                spacingClass,
                AVATAR_Z_INDEX[index] ?? "z-0",
              )}
            >
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pictureUrl}
                  alt={u.user ? identifyUser(u.user) : initials}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          "mt-1 whitespace-nowrap rounded-lg border px-2 py-0.5 text-[11px] font-extrabold shadow-sm",
          isDark
            ? "border-slate-400/25 bg-slate-900/90 text-slate-50"
            : "border-slate-900/12 bg-white/92 text-slate-900",
        )}
      >
        {items.length} Persons
      </div>
    </div>
  );
};
