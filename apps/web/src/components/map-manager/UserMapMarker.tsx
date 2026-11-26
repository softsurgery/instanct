import React from "react";
import type { ExperimentalConnectedUserState } from "api-client";
import {
  cn,
  identifyUser,
  identifyUserAvatar,
  useCountdown,
} from "@softsurgery/lib";

interface UserMapMarkerProps {
  item: ExperimentalConnectedUserState;
  pictureUrl?: string;
  isSelected: boolean;
  isPlacing: boolean;
  isDark: boolean;
}

export const UserMapMarker: React.FC<UserMapMarkerProps> = ({
  item,
  pictureUrl,
  isSelected,
  isPlacing,
  isDark,
}) => {
  const label = item.user ? identifyUser(item.user) : item.userId.slice(0, 8);
  const initials = identifyUserAvatar(item.user);
  const isRealSession = item.isExperimental === false;
  const session = item.activeSession;
  const startRaw = session?.plannedStart;
  const endRaw = session?.plannedEnd;
  const startDate = startRaw ? new Date(startRaw) : null;
  const endDate = endRaw ? new Date(endRaw) : null;
  const hasValidStart = startDate && !Number.isNaN(startDate.getTime());
  const hasValidEnd = endDate && !Number.isNaN(endDate.getTime());

  const [isHovered, setIsHovered] = React.useState(false);
  const { formatted: countdown, isExpired } = useCountdown(endRaw, isHovered);

  const hasSessionDetails = Boolean(endRaw || hasValidStart || hasValidEnd);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex cursor-pointer flex-col items-center"
    >
      {hasSessionDetails && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-full z-50 mb-2 hidden w-max flex-col gap-0.5 rounded-md border px-2.5 py-1.5 text-[11px] shadow-lg group-hover:flex",
            isDark
              ? "border-slate-700 bg-slate-900/95 text-slate-100"
              : "border-slate-200 bg-white/95 text-slate-900",
          )}
        >
          {endRaw && (
            <div
              className={cn(
                "font-semibold tabular-nums",
                isExpired && "text-destructive",
              )}
            >
              {countdown}
            </div>
          )}
          {hasValidStart && (
            <div
              className={cn(
                "text-[10px]",
                isDark ? "text-slate-300" : "text-slate-600",
              )}
            >
              Start: {startDate.toLocaleDateString()}{" "}
              {startDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {hasValidEnd && (
            <div
              className={cn(
                "text-[10px]",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              End: {endDate.toLocaleDateString()}{" "}
              {endDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-[3px] text-xs font-bold text-white ring-2 shadow-md",
          isPlacing
            ? "border-amber-500 bg-amber-500"
            : isSelected
              ? "border-blue-600 bg-blue-600"
              : isRealSession
                ? "border-cyan-600 bg-cyan-600"
                : "border-green-600 bg-green-600",
          isDark ? "ring-slate-900" : "ring-white",
        )}
      >
        {pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pictureUrl}
            alt={label}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div
        className={cn(
          "mt-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow-sm",
          isDark
            ? "border-slate-400/25 bg-slate-900/90 text-slate-50"
            : "border-slate-900/12 bg-white/92 text-slate-900",
        )}
      >
        {label}
      </div>
    </div>
  );
};
