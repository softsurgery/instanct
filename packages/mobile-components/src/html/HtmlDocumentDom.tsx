"use dom";

import React from "react";
import { cn } from "@softsurgery/lib";
import "@softsurgery/lib/legal/legal-html.css";

export type HtmlDocumentDomProps = {
  html?: string;
  className?: string;
  paletteStr?: string;
  dom?: import("expo/dom").DOMProps;
  htmlStyles?: React.CSSProperties;
  /** Exact width to apply to the web document (e.g. 320, '100%', '300px'). */
  width?: number | string;
  /** Whether scrolling is enabled in the DOM document. Defaults to false. */
  scrollEnabled?: boolean;
  /** Whether bouncing/overscroll is enabled in the DOM document. Defaults to false. */
  bounces?: boolean;
  /** Ask the native host to open external links outside this WebView. */
  openLinksExternally?: boolean;
};

const EXTERNAL_HREF = /^(https?:|mailto:|tel:|sms:|\/\/)/i;

function postWebViewMessage(payload: { type: string; url?: string }) {
  const message = JSON.stringify(payload);
  const win = window as Window & {
    ReactNativeWebView?: { postMessage?: (data: string) => void };
    webkit?: {
      messageHandlers?: {
        ReactNativeWebView?: { postMessage?: (data: string) => void };
      };
    };
  };

  if (typeof win.ReactNativeWebView?.postMessage === "function") {
    win.ReactNativeWebView.postMessage(message);
    return true;
  }

  const webkitPost =
    win.webkit?.messageHandlers?.ReactNativeWebView?.postMessage;
  if (typeof webkitPost === "function") {
    webkitPost(message);
    return true;
  }

  return false;
}

export default function HtmlDocumentDom({
  html,
  className,
  paletteStr,
  htmlStyles,
  width,
  scrollEnabled = false,
  bounces = false,
  openLinksExternally = false,
}: HtmlDocumentDomProps) {
  const formattedWidth = React.useMemo(() => {
    if (width === undefined || width === null) {
      return "100%";
    }
    return typeof width === "number" ? `${width}px` : String(width);
  }, [width]);

  const documentStyles = React.useMemo(
    () => `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${formattedWidth} !important;
      max-width: ${formattedWidth} !important;
      ${width !== undefined && width !== null ? `min-width: ${formattedWidth} !important;` : ""}
      box-sizing: border-box !important;
      scrollbar-width: none;
      -ms-overflow-style: none;
      ${
        scrollEnabled
          ? `
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: auto !important;
      min-height: 100% !important;
      touch-action: pan-y !important;
      -webkit-overflow-scrolling: touch;
      `
          : `
      overflow: hidden !important;
      overflow-x: hidden !important;
      overflow-y: hidden !important;
      height: 100% !important;
      max-height: 100% !important;
      touch-action: none !important;
      -webkit-overflow-scrolling: auto;
      `
      }
      ${
        bounces
          ? `
      overscroll-behavior: auto !important;
      -webkit-overscroll-behavior: auto !important;
      `
          : `
      overscroll-behavior: none !important;
      -webkit-overscroll-behavior: none !important;
      `
      }
    }

    #root {
      margin: 0 !important;
      padding: 0 !important;
      width: ${formattedWidth} !important;
      max-width: ${formattedWidth} !important;
      box-sizing: border-box !important;
      ${!scrollEnabled ? "height: 100% !important; overflow: hidden !important;" : ""}
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    .legal-html {
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      word-break: break-word;
      overflow-wrap: break-word;
    }
  `,
    [formattedWidth, width, scrollEnabled, bounces],
  );

  const palette = React.useMemo(() => {
    if (!paletteStr) return null;

    try {
      return JSON.parse(paletteStr);
    } catch {
      return null;
    }
  }, [paletteStr]);

  const cssVars = React.useMemo(
    () =>
      palette
        ? ({
            "--foreground": palette.foreground,
            "--background": palette.background,
            "--primary": palette.primary,
            "--card": palette.card,
            "--border": palette.border,
            "--muted": palette.muted,
            "--muted-foreground": palette.mutedForeground,
            "--secondary": palette.secondary,
            "--secondary-foreground": palette.secondaryForeground,
            "--radius": palette.radius || "0.5rem",
          } as React.CSSProperties)
        : {},
    [palette],
  );

  React.useEffect(() => {
    if (!html) return;

    let cancelled = false;

    const notifyReady = () => {
      if (cancelled) return;
      try {
        if (!postWebViewMessage({ type: "HTML_READY" })) {
          setTimeout(notifyReady, 40);
        }
      } catch {
        setTimeout(notifyReady, 40);
      }
    };

    const rafId = requestAnimationFrame(notifyReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [html]);

  React.useEffect(() => {
    if (!openLinksExternally) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href")?.trim() ?? "";
      if (!rawHref || !EXTERNAL_HREF.test(rawHref)) return;

      const url = anchor.href;
      if (!url) return;

      event.preventDefault();
      event.stopPropagation();
      postWebViewMessage({ type: "OPEN_EXTERNAL_LINK", url });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [openLinksExternally]);

  return (
    <>
      <style>{documentStyles}</style>
      <div
        className={cn("legal-html", className)}
        style={{
          ...cssVars,
          width: formattedWidth,
          maxWidth: formattedWidth,
          boxSizing: "border-box",
          ...htmlStyles,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "var(--foreground)",
          backgroundColor: "transparent",
          minHeight: scrollEnabled ? "100%" : undefined,
          height: !scrollEnabled ? "100%" : undefined,
          overflow: !scrollEnabled ? "hidden" : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </>
  );
}
