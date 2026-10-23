import React from "react";
import { Linking, Platform } from "react-native";
import HtmlDocumentDom from "./HtmlDocumentDom";

const EXTERNAL_URL = /^(https?:|mailto:|tel:|sms:)/i;
const SPECIAL_SCHEME = /^(mailto:|tel:|sms:)/i;

function isSameOrigin(url: string, documentUrl: string) {
  try {
    return new URL(url).origin === new URL(documentUrl).origin;
  } catch {
    return url === documentUrl;
  }
}

function shouldOpenOutsideWebView(
  url: string,
  documentUrl: string | null,
  navigationType?: string,
) {
  if (!url || !EXTERNAL_URL.test(url)) return false;
  if (SPECIAL_SCHEME.test(url)) return true;
  if (
    navigationType === "reload" ||
    navigationType === "backforward" ||
    navigationType === "formsubmit" ||
    navigationType === "formresubmit"
  ) {
    return false;
  }
  if (!documentUrl) return false;
  return !isSameOrigin(url, documentUrl);
}

export type HtmlDocumentProps = {
  html?: string;
  className?: string;
  paletteStr?: string;
  dom?: import("expo/dom").DOMProps;
  htmlStyles?: React.CSSProperties;
  /** Whether to inject the DOM runtime environment globals before content loads (fixes $$EXPO_DOM_HOST_OS error) */
  enableBridgeInjection?: boolean;
  /** Called when the HTML has been parsed and painted into the DOM. */
  onReady?: () => void;
  /** Exact width to apply to the web document and WebView container (e.g. 320, '100%', '300px'). */
  width?: number | string;
  /** Whether scrolling is enabled in the document. Defaults to false. */
  scrollEnabled?: boolean;
  /** Alias for scrollEnabled. Defaults to false. */
  scrollable?: boolean;
  /** Whether elastic bounce effect is enabled on edges (iOS/Android/web). Defaults to false. */
  bounces?: boolean;
  /** Alias for bounces. Defaults to false. */
  bouncing?: boolean;
  /** Native container ViewStyle */
  style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
  /**
   * Open http(s), mailto, tel, and sms links in the device browser
   * instead of navigating this WebView.
   */
  openLinksExternally?: boolean;
};

export const DEFAULT_DOM_BRIDGE_INJECTION_SCRIPT = `
  window.ReactNativeWebView = window.ReactNativeWebView || {};
  window.ReactNativeWebView.injectedObjectJson = function() {
    return JSON.stringify({
      EXPO_DOM_HOST_OS: "${Platform.OS}",
      initialProps: { names: [], props: {} }
    });
  };
  window.$$EXPO_DOM_HOST_OS = "${Platform.OS}";
  window.$$EXPO_INITIAL_PROPS = { names: [], props: {} };
  true;
`;

export default function HtmlDocument({
  html,
  className,
  paletteStr,
  dom,
  htmlStyles,
  enableBridgeInjection = true,
  onReady,
  width,
  scrollEnabled,
  scrollable,
  bounces,
  bouncing,
  style,
  openLinksExternally = false,
}: HtmlDocumentProps) {
  const documentUrlRef = React.useRef<string | null>(null);
  const recentlyOpenedUrl = React.useRef<{ url: string; at: number } | null>(
    null,
  );

  const openExternalUrl = React.useCallback((url: string) => {
    const now = Date.now();
    const recent = recentlyOpenedUrl.current;
    if (recent && recent.url === url && now - recent.at < 800) return;
    recentlyOpenedUrl.current = { url, at: now };
    Linking.openURL(url).catch(() => {});
  }, []);
  const resolvedWidth = React.useMemo(() => {
    if (width !== undefined) return width;
    if (style && typeof style === "object" && "width" in style) {
      return (style as any).width;
    }
    if (dom?.style && typeof dom.style === "object" && "width" in dom.style) {
      return (dom.style as any).width;
    }
    return undefined;
  }, [width, style, dom?.style]);

  const finalScrollEnabled =
    scrollEnabled ??
    scrollable ??
    dom?.scrollEnabled ??
    false;

  const finalBounces =
    bounces ??
    bouncing ??
    dom?.bounces ??
    false;

  const domProps = React.useMemo<import("expo/dom").DOMProps>(() => {
    const injectedScript = enableBridgeInjection
      ? DEFAULT_DOM_BRIDGE_INJECTION_SCRIPT
      : null;

    const mergedInjectedScript = [
      injectedScript,
      dom?.injectedJavaScriptBeforeContentLoaded,
    ]
      .filter(Boolean)
      .join("\n");

    const handleMessage = (event: any) => {
      try {
        const payload =
          typeof event?.nativeEvent?.data === "string"
            ? JSON.parse(event.nativeEvent.data)
            : event?.nativeEvent?.data;
        if (payload?.type === "HTML_READY") {
          onReady?.();
        } else if (
          openLinksExternally &&
          payload?.type === "OPEN_EXTERNAL_LINK" &&
          typeof payload.url === "string"
        ) {
          openExternalUrl(payload.url);
        }
      } catch {}
      dom?.onMessage?.(event);
    };

    const handleShouldStartLoadWithRequest: NonNullable<
      import("expo/dom").DOMProps["onShouldStartLoadWithRequest"]
    > = (request) => {
      const allow = dom?.onShouldStartLoadWithRequest?.(request) ?? true;
      if (!allow) return false;
      if (!openLinksExternally || request.isTopFrame === false) return true;
      if (
        shouldOpenOutsideWebView(
          request.url,
          documentUrlRef.current,
          request.navigationType,
        )
      ) {
        openExternalUrl(request.url);
        return false;
      }
      return true;
    };

    const handleLoadEnd: NonNullable<
      import("expo/dom").DOMProps["onLoadEnd"]
    > = (event) => {
      const url = event.nativeEvent?.url;
      if (openLinksExternally && typeof url === "string" && url.length > 0) {
        documentUrlRef.current = url;
      }
      dom?.onLoadEnd?.(event);
    };

    const handleOpenWindow: NonNullable<
      import("expo/dom").DOMProps["onOpenWindow"]
    > = (event) => {
      const url = event.nativeEvent?.targetUrl;
      if (
        openLinksExternally &&
        typeof url === "string" &&
        shouldOpenOutsideWebView(url, documentUrlRef.current, "click")
      ) {
        openExternalUrl(url);
      }
      dom?.onOpenWindow?.(event);
    };

    const baseStyle = {
      backgroundColor: "transparent",
      ...(resolvedWidth !== undefined ? { width: resolvedWidth } : { flex: 1 }),
    };

    return {
      useExpoDOMWebView: false,
      ...dom,
      scrollEnabled: finalScrollEnabled,
      bounces: finalBounces,
      alwaysBounceVertical: finalBounces,
      alwaysBounceHorizontal: finalBounces,
      overScrollMode: (finalBounces ? "always" : "never") as "always" | "never",
      showsVerticalScrollIndicator:
        dom?.showsVerticalScrollIndicator ?? (finalScrollEnabled ? true : false),
      showsHorizontalScrollIndicator:
        dom?.showsHorizontalScrollIndicator ?? false,
      style: [baseStyle, dom?.style, style].filter(Boolean),
      onMessage: handleMessage,
      onLoadEnd: handleLoadEnd,
      ...(openLinksExternally
        ? {
            setSupportMultipleWindows: false,
            onShouldStartLoadWithRequest: handleShouldStartLoadWithRequest,
            onOpenWindow: handleOpenWindow,
          }
        : {}),
      ...(mergedInjectedScript
        ? { injectedJavaScriptBeforeContentLoaded: mergedInjectedScript }
        : {}),
    };
  }, [
    dom,
    enableBridgeInjection,
    onReady,
    openExternalUrl,
    openLinksExternally,
    finalScrollEnabled,
    finalBounces,
    resolvedWidth,
    style,
  ]);

  return (
    <HtmlDocumentDom
      html={html}
      className={className}
      paletteStr={paletteStr}
      htmlStyles={htmlStyles}
      dom={domProps}
      width={resolvedWidth}
      scrollEnabled={finalScrollEnabled}
      bounces={finalBounces}
      openLinksExternally={openLinksExternally}
    />
  );
}
