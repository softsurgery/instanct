import { getSocket, type Socket } from "@softsurgery/lib";
import { getClientDeviceInfo } from "@/lib/device-info";
import { getDeviceMacAddress } from "@/lib/device-mac";

/**
 * Opens (or reuses) the mobile presence socket with device metadata.
 */
export async function connectMobilePresence(
  accessToken: string,
): Promise<Socket> {
  const deviceInfo = getClientDeviceInfo();
  let macAddress = "02:00:00:00:00:00";
  try {
    macAddress = await getDeviceMacAddress();
  } catch (error) {
    console.warn("Failed to get device MAC for presence:", error);
  }

  const socket = getSocket("presence", {
    token: accessToken,
    source: "mobile",
    device: deviceInfo.device,
    os: deviceInfo.os,
    macAddress,
  });

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Waits briefly for the presence socket to connect (best-effort).
 */
export async function waitForPresenceConnection(
  socket: Socket,
  timeoutMs = 8_000,
): Promise<void> {
  if (socket.connected) return;

  await new Promise<void>((resolve) => {
    const onConnect = () => {
      socket.off("connect", onConnect);
      resolve();
    };
    socket.on("connect", onConnect);
    setTimeout(() => {
      socket.off("connect", onConnect);
      resolve();
    }, timeoutMs);
  });
}
