/// <reference path="../css.d.ts" />
import "@videojs/react/i18n/locales/ar/register";
import skinCss from "@videojs/react/video/skin.css?raw";

import { I18nProvider } from "@videojs/react/i18n";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import {
  Video as VideoJsVideo,
  VideoPlayer,
  VideoSkin,
} from "@videojs/react/video";
import { cn } from "../lib/utils";
import React from "react";

export type VideoSourceKind = "auto" | "file" | "hls" | "youtube";

export interface VideoProps {
  src: string;
  poster?: string;
  title?: string;
  kind?: VideoSourceKind;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

const YOUTUBE_SRC = /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i;
const HLS_SRC = /\.m3u8(?:[?#]|$)/i;
const SKIN_STYLE_ID = "qlp-videojs-skin";
const UNSAFE_ANCHOR_CHARS = /[^a-zA-Z0-9_-]/g;

function ensureVideoSkinStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SKIN_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SKIN_STYLE_ID;
  style.textContent = skinCss;
  document.head.appendChild(style);
}

function resolveKind(src: string, kind: VideoSourceKind = "auto") {
  if (kind !== "auto") return kind;
  if (YOUTUBE_SRC.test(src)) return "youtube";
  if (HLS_SRC.test(src)) return "hls";
  return "file";
}

function findPopoverTrigger(popup: HTMLElement) {
  let node = popup.previousElementSibling;
  while (node) {
    if (node instanceof HTMLElement && node.tagName === "BUTTON") return node;
    const button = node.querySelector?.("button");
    if (button instanceof HTMLElement) return button;
    node = node.previousElementSibling;
  }
  return null;
}

function anchorPopovers(root: HTMLElement, prefix: string) {
  const names = new WeakMap<Element, string>();
  let seq = 0;

  const assign = () => {
    root.querySelectorAll(".media-button").forEach((button) => {
      if (!(button instanceof HTMLElement) || names.has(button)) return;
      const name = `--${prefix}-${seq++}`;
      names.set(button, name);
      button.style.setProperty("anchor-name", name);
    });
    root.querySelectorAll("[popover]").forEach((popup) => {
      if (!(popup instanceof HTMLElement)) return;
      const trigger = findPopoverTrigger(popup);
      const name = trigger ? names.get(trigger) : undefined;
      if (!name) return;
      popup.style.setProperty("position-anchor", name);
    });
  };

  assign();
  const observer = new MutationObserver(assign);
  observer.observe(root, { subtree: true, childList: true });
  return () => observer.disconnect();
}

export function Video({
  src,
  poster,
  title,
  kind = "auto",
  className,
  autoPlay,
  muted,
  loop,
  playsInline = true,
}: VideoProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const anchorPrefix =
    React.useId().replace(UNSAFE_ANCHOR_CHARS, "") || "video";

  React.useLayoutEffect(() => {
    ensureVideoSkinStyles();
    const root = rootRef.current;
    if (!root) return;
    return anchorPopovers(root, `qlp-video-${anchorPrefix}`);
  }, [anchorPrefix]);

  const sourceKind = resolveKind(src, kind);
  const mediaProps = {
    src,
    poster,
    autoPlay,
    muted,
    loop,
    playsInline,
    preload: "metadata" as const,
  };

  const media =
    sourceKind === "youtube" ? (
      <YouTubeVideo {...mediaProps} />
    ) : sourceKind === "hls" ? (
      <HlsJsVideo {...mediaProps} />
    ) : (
      <VideoJsVideo {...mediaProps} />
    );

  return (
    <I18nProvider>
      <VideoPlayer poster={poster} title={title}>
        <div
          ref={rootRef}
          className={cn("qlp-video aspect-video w-full bg-black", className)}
        >
          <VideoSkin className="qlp-video-skin">{media}</VideoSkin>
        </div>
      </VideoPlayer>
    </I18nProvider>
  );
}

Video.displayName = "Video";
