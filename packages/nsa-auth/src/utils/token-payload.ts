import { Request } from "express";
import { SocketPayload } from "@softsurgery/nsa-helpers/http";

/**
 * Decode a JWT payload without verifying its signature.
 * Returns null if the token is malformed or the payload is invalid.
 */
function decodeTokenPayload(token: string): SocketPayload | null {
  try {
    const parts = token.split(".");

    // A JWT must contain header, payload, and signature.
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    // Convert Base64URL to Base64.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    // Restore Base64 padding.
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const payload = JSON.parse(atob(paddedBase64));

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return null;
    }

    return payload as SocketPayload;
  } catch {
    return null;
  }
}

/**
 * Extract the JWT from an Express Authorization header.
 */
export function getTokenPayload(request: Request): any {
  const authorization = request.headers?.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return null;
  }

  return decodeTokenPayload(token);
}

/**
 * Extract the JWT from a Socket.IO handshake.
 * Supports both the Authorization header and socket.handshake.auth.token.
 */
export function getTokenPayloadForWebSocket(socket: any): SocketPayload | null {
  const authorization = socket?.handshake?.headers?.authorization;

  if (typeof authorization === "string") {
    if (!authorization.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return null;
    }

    return decodeTokenPayload(token);
  }

  const authToken = socket?.handshake?.auth?.token;

  if (typeof authToken !== "string" || !authToken.trim()) {
    return null;
  }

  // socket.handshake.auth.token is expected to contain the raw JWT.
  return decodeTokenPayload(authToken.trim());
}
