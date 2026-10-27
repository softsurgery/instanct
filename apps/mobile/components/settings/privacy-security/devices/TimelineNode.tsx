import { View } from "react-native";

interface TimelineNodeProps {
  isLast?: boolean;
  isFirst?: boolean;
}

export const TimelineNode = ({
  isLast = false,
  isFirst = false,
}: TimelineNodeProps) => (
  <View className="w-8 items-center justify-center relative">
    {/* Line above dot (connects from card above if not first) */}
    {!isFirst && (
      <View
        style={{
          position: "absolute",
          top: -14,
          bottom: "50%",
          left: 15.5,
          width: 0,
          borderLeftWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "rgba(156, 163, 175, 0.4)",
        }}
      />
    )}
    {/* Line below dot (connects to card below if not last) */}
    {!isLast && (
      <View
        style={{
          position: "absolute",
          top: "50%",
          bottom: -14,
          left: 15.5,
          width: 0,
          borderLeftWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "rgba(156, 163, 175, 0.4)",
        }}
      />
    )}
    {/* Center dot */}
    <View className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50 z-10" />
  </View>
);
