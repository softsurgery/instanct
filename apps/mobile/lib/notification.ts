import { Platform } from "react-native";

export let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  console.warn("expo-notifications is not available");
}

export async function requestNotificationPermissions() {
  if (!Notifications) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted");
  }
}

export async function createAndroidChannel() {
  if (Platform.OS === "android" && Notifications) {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}
