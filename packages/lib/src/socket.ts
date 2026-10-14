import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { delay } from "./delay";

export type { Socket, ManagerOptions, SocketOptions };

export type SocketNamespace =
  | "presence"
  | "admin/presence"
  | "chat"
  | "notifications"
  | "geolocation"
  | string;

const sockets: Record<string, Socket> = {};
const socketTokens: Record<string, string | undefined> = {};

let customBaseUrl: string | null = null;

export interface SocketConfig extends Partial<ManagerOptions & SocketOptions> {
  token?: string;
  source?: string;
}

/**
 * Allows overriding or explicitly specifying the base URL for WebSocket connections.
 */
export function setSocketBaseUrl(url: string | null): void {
  customBaseUrl = url;
}

/**
 * Resolves the base URL for WebSocket connections across Web (Next.js) and Mobile (Expo/React Native).
 */
export function getSocketBaseUrl(): string {
  if (customBaseUrl) {
    return customBaseUrl;
  }

  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL;
    }
    if (process.env.EXPO_PUBLIC_API_SOCKET_URL) {
      return process.env.EXPO_PUBLIC_API_SOCKET_URL;
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/api\/?$/, "");
    }
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, "");
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost:5000";
}

/**
 * Detects default client platform source ('mobile' vs 'web').
 */
export function getDefaultSocketSource(): string {
  if (
    typeof process !== "undefined" &&
    process.env?.EXPO_PUBLIC_API_SOCKET_URL
  ) {
    return "mobile";
  }

  if (
    typeof navigator !== "undefined" &&
    (navigator as { product?: string }).product === "ReactNative"
  ) {
    return "mobile";
  }

  return "web";
}

/**
 * Returns artificial emission delay if configured in environment variables.
 */
function getGlobalDelay(): number {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_GLOBAL_DELAY) {
    const parsed = parseInt(process.env.EXPO_PUBLIC_GLOBAL_DELAY, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Applies artificial emission delay to socket emits if configured.
 */
function applyDelayIfNeeded(socket: Socket): void {
  const globalDelay = getGlobalDelay();
  if (globalDelay <= 0) return;

  const originalEmit = socket.emit.bind(socket);
  socket.emit = ((...args: Parameters<Socket["emit"]>) => {
    void delay(globalDelay).then(() => {
      originalEmit(...args);
    });
    return socket;
  }) as Socket["emit"];
}

/**
 * Retrieves or establishes a singleton Socket.IO connection for the specified namespace.
 * Automatically attaches authentication token and client source to handshake headers and query params.
 */
export function getSocket(
  namespace: SocketNamespace,
  config: SocketConfig = {},
  baseUrl: string = getSocketBaseUrl(),
): Socket {
  const cleanNamespace = namespace.startsWith("/")
    ? namespace.slice(1)
    : namespace;
  const socketKey = cleanNamespace;

  if (sockets[socketKey]) {
    if (socketTokens[socketKey] !== config.token) {
      sockets[socketKey].disconnect();
      delete sockets[socketKey];
      delete socketTokens[socketKey];
    } else {
      return sockets[socketKey];
    }
  }

  const defaultSource = getDefaultSocketSource();
  const { token, source = defaultSource, ...options } = config;
  const globalDelay = getGlobalDelay();

  const socket = io(`${baseUrl}/${cleanNamespace}`, {
    transports: ["websocket"],
    auth: {
      ...(token ? { token } : {}),
      source,
      ...(options.auth as Record<string, unknown> | undefined),
    },
    query: {
      source,
      ...(options.query as Record<string, unknown> | undefined),
    },
    extraHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-client-source": source,
      ...(options.extraHeaders as Record<string, string> | undefined),
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    ...options,
    ...(globalDelay > 0 ? { autoConnect: false } : {}),
  });

  applyDelayIfNeeded(socket);

  if (globalDelay > 0) {
    void delay(globalDelay).then(() => socket.connect());
  }

  socketTokens[socketKey] = token;
  sockets[socketKey] = socket;
  return socket;
}

/**
 * Disconnects and destroys the active socket for a given namespace.
 */
export function disconnectSocket(namespace: SocketNamespace): void {
  const cleanNamespace = namespace.startsWith("/")
    ? namespace.slice(1)
    : namespace;
  const socket = sockets[cleanNamespace];
  if (socket) {
    socket.disconnect();
    delete sockets[cleanNamespace];
    delete socketTokens[cleanNamespace];
  }
}

/**
 * Disconnects and cleans up all active socket connections.
 */
export function disconnectAllSockets(): void {
  Object.keys(sockets).forEach((key) => {
    sockets[key]?.disconnect();
    delete sockets[key];
    delete socketTokens[key];
  });
}
