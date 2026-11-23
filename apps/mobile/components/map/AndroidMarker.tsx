import React from "react";
import { Animated, Platform, View } from "react-native";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import type { PulsePoint } from "@softsurgery/mobile-hooks";

interface MarkerCaptureLayerProps {
  items: {
    id: string;
    captureKey?: string;
    content: React.ReactNode;
  }[];
  onCapture: (id: string, uri: string) => void;
}

/**
 * Renders marker views offscreen and captures them as images via ViewShot.
 * Used on Android to bypass the canvas bitmap rendering bug in react-native-maps
 * where Marker children are clipped or not rendered properly.
 *
 * Must be rendered OUTSIDE of MapView (as a sibling).
 */
export const MarkerCaptureLayer = ({
  items,
  onCapture,
}: MarkerCaptureLayerProps) => {
  if (Platform.OS !== "android") return null;

  return (
    <View
      style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }}
      pointerEvents="none"
      collapsable={false}
    >
      {items.map((item) => (
        <MarkerCaptureItem
          key={item.id}
          id={item.id}
          captureKey={item.captureKey}
          onCapture={onCapture}
        >
          {item.content}
        </MarkerCaptureItem>
      ))}
    </View>
  );
};

interface MarkerCaptureItemProps {
  id: string;
  captureKey?: string;
  children: React.ReactNode;
  onCapture: (id: string, uri: string) => void;
}

const MarkerCaptureItem = ({
  id,
  captureKey,
  children,
  onCapture,
}: MarkerCaptureItemProps) => {
  const viewShotRef = React.useRef<ViewShotRef>(null);
  const captureTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const capture = React.useCallback(() => {
    if (captureTimeout.current) clearTimeout(captureTimeout.current);
    captureTimeout.current = setTimeout(async () => {
      try {
        if (viewShotRef.current) {
          const uri = await (viewShotRef.current as any).capture();
          onCapture(id, uri);
        }
      } catch {
        // View may not be laid out yet, will retry
      }
    }, 150);
  }, [id, onCapture]);

  // Re-capture only when marker visual state (captureKey) changes, not on every parent render
  React.useEffect(() => {
    capture();
    // Second capture to catch async-loaded images (e.g. profile pictures)
    const delayedCapture = setTimeout(capture, 1200);
    return () => {
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
      clearTimeout(delayedCapture);
    };
  }, [captureKey, capture]);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", result: "tmpfile" }}
      onLayout={capture}
    >
      {children}
    </ViewShot>
  );
};

interface AndroidPulseOverlayProps {
  points: PulsePoint[];
  scale: Animated.Value;
  opacity: Animated.Value;
  visible: boolean;
  size?: number;
  yOffset?: number;
}

/**
 * Renders native-driver 60fps pulse rings in screen-space over MapView on Android,
 * avoiding Google Maps' laggy Marker bitmap re-rasterization.
 */
export const AndroidPulseOverlay = ({
  points,
  scale,
  opacity,
  visible,
  size = 40,
  yOffset = 0,
}: AndroidPulseOverlayProps) => {
  if (Platform.OS !== "android" || !visible || points.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {points.map((pt) => (
        <Animated.View
          key={pt.id}
          style={{
            position: "absolute",
            left: pt.x - size / 2,
            top: pt.y + yOffset - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2.5,
            borderColor: "rgba(34, 197, 94, 0.85)",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            transform: [{ scale }],
            opacity,
          }}
        />
      ))}
    </View>
  );
};
