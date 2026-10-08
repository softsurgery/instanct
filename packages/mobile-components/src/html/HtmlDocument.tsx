"use dom";
import React from "react";
import { cn } from "@instanct/lib";
import "@instanct/lib/legal/legal-html.css";

export type HtmlDocumentProps = {
  html?: string;
  className?: string;
  paletteStr?: string;
  /** Called (on the native side) once the HTML has been rendered in the WebView. */
  onReady?: () => Promise<void> | void;
  dom?: import("expo/dom").DOMProps;
  htmlStyles?: React.CSSProperties;
};

const HIDE_SCROLLBAR_CSS = `
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;

export default function HtmlDocument({
  html,
  className,
  paletteStr,
  onReady,
  htmlStyles,
}: HtmlDocumentProps) {
  React.useEffect(() => {
    if (html) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  const palette = paletteStr ? JSON.parse(paletteStr) : null;
  const cssVars = palette
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
    : {};

  return (
    <>
      <style>{HIDE_SCROLLBAR_CSS}</style>
      <div
        className={cn("legal-html", className)}
        style={{
          ...cssVars,
          ...htmlStyles,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "var(--foreground)",
          backgroundColor: "transparent",
          minHeight: "100vh",
        }}
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </>
  );
}
