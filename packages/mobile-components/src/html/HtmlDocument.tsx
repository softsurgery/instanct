import React from "react";
import { Platform } from "react-native";
import HtmlDocumentDom from "./HtmlDocumentDom";

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
}: HtmlDocumentProps) {
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
        }
      } catch {}
      dom?.onMessage?.(event);
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
      ...(mergedInjectedScript
        ? { injectedJavaScriptBeforeContentLoaded: mergedInjectedScript }
        : {}),
    };
  }, [
    dom,
    enableBridgeInjection,
    onReady,
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
    />
  );
}
