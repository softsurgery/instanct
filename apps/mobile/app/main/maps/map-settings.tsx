import { MapSettings } from "@/components/map/MapSettings/MapSettings";
import { Stack } from "expo-router";

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <MapSettings />
    </>
  );
}
