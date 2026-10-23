import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  AppleJWK,
  AppleClientSecretConfig,
  AppleJWKSResponse,
} from "../interfaces/apple.interface";

export class AppleAuthUtils {
  private static jwksCache: {
    keys: AppleJWK[];
    fetchedAt: number;
  } | null = null;

  private static readonly JWKS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Resolves the Apple .p8 private key either from an environment string
   * (formatted or raw base64) or from a file path.
   */
  public static resolvePrivateKey(
    privateKey?: string,
    privateKeyPath?: string,
  ): string {
    if (privateKey && privateKey.trim().length > 0) {
      let key = privateKey.trim();
      // Handle escaped newlines from environment strings (e.g. \n)
      if (key.includes("\\n")) {
        key = key.replace(/\\n/g, "\n");
      }
      if (key.includes("BEGIN PRIVATE KEY")) {
        return key;
      }
      // If provided as raw base64 without headers, reconstruct standard PKCS#8 PEM
      return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
    }

    if (privateKeyPath && privateKeyPath.trim().length > 0) {
      const resolvedPath = path.isAbsolute(privateKeyPath)
        ? privateKeyPath
        : path.resolve(process.cwd(), privateKeyPath);

      if (fs.existsSync(resolvedPath)) {
        return fs.readFileSync(resolvedPath, "utf8").trim();
      }
    }

    // Default lookup in conventional repository path
    const fallbackPath = path.resolve(
      process.cwd(),
      "env",
      "AuthKey_CM4NR9YR9G.p8",
    );
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, "utf8").trim();
    }

    throw new Error(
      "Apple private key (.p8) could not be resolved. Please set APPLE_PRIVATE_KEY or APPLE_PRIVATE_KEY_PATH.",
    );
  }

  /**
   * Generates an Apple client secret JWT signed with ES256.
   * Required claims per Apple documentation:
   * - iss: Apple Team ID
   * - iat: issued-at timestamp (seconds)
   * - exp: expiration timestamp (max 6 months: 15777000s)
   * - aud: "https://appleid.apple.com"
   * - sub: Apple Client ID / Services ID / Bundle ID
   * Header:
   * - alg: "ES256"
   * - kid: Apple 10-char Key ID
   */
  public static generateClientSecret(config: AppleClientSecretConfig): string {
    const {
      clientId,
      teamId,
      keyId,
      privateKey,
      privateKeyPath,
      expiresInSeconds = 5 * 60 * 60, // 5 hours default (safely under 6-month limit)
    } = config;

    if (!clientId) {
      throw new Error("Apple clientId (Services ID / Bundle ID) is required");
    }
    if (!teamId) {
      throw new Error("Apple teamId is required");
    }
    if (!keyId) {
      throw new Error("Apple keyId is required");
    }

    const keyPem = this.resolvePrivateKey(privateKey, privateKeyPath);

    // Apple enforces max expiration of 180 days (15777000 seconds)
    const maxExpiration = 180 * 24 * 60 * 60;
    const safeExpiresIn = Math.min(
      Math.max(60, expiresInSeconds),
      maxExpiration,
    );

    const now = Math.floor(Date.now() / 1000);
    const exp = now + safeExpiresIn;

    const header = {
      alg: "ES256",
      kid: keyId,
      typ: "JWT",
    };

    const payload = {
      iss: teamId,
      iat: now,
      exp,
      aud: "https://appleid.apple.com",
      sub: clientId,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const sign = crypto.createSign("SHA256");
    sign.update(signingInput);

    // ES256 in JWT format expects raw IEEE P1363 (r || s, 64 bytes) signature
    const signature = sign.sign(
      {
        key: keyPem,
        dsaEncoding: "ieee-p1363",
      },
      "base64url",
    );

    return `${signingInput}.${signature}`;
  }

  /**
   * Fetches Apple's public JSON Web Key Set (JWKS).
   */
  public static async fetchAppleJwks(): Promise<AppleJWK[]> {
    const now = Date.now();
    if (
      this.jwksCache &&
      now - this.jwksCache.fetchedAt < this.JWKS_CACHE_TTL_MS
    ) {
      return this.jwksCache.keys;
    }

    const res = await fetch("https://appleid.apple.com/auth/keys");
    if (!res.ok) {
      throw new Error(`Failed to fetch Apple public keys: ${res.statusText}`);
    }

    const data: AppleJWKSResponse = await res.json();
    if (!data?.keys || !Array.isArray(data.keys)) {
      throw new Error("Invalid JWKS response format from Apple");
    }

    this.jwksCache = {
      keys: data.keys,
      fetchedAt: now,
    };

    return data.keys;
  }

  /**
   * Verifies an Apple ID token using Apple's public JWKS.
   * Validates:
   * - Algorithm is RS256
   * - Key ID matches Apple's public keys
   * - Cryptographic signature against Apple public key
   * - Issuer is "https://appleid.apple.com"
   * - Token is not expired
   * - Audience matches any of the allowed client IDs (e.g. mobile bundle ID or web services ID)
   */
  public static async verifyIdToken<T = any>(
    idToken: string,
    allowedAudiences?: string[],
  ): Promise<T> {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(
      Buffer.from(headerB64, "base64url").toString("utf8"),
    );
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );

    if (header.alg !== "RS256") {
      throw new Error(`Unsupported token algorithm: ${header.alg}`);
    }

    const jwks = await this.fetchAppleJwks();
    const matchingKey = jwks.find((k) => k.kid === header.kid);
    if (!matchingKey) {
      throw new Error(`Apple public key not found for kid: ${header.kid}`);
    }

    // Convert JWK to CryptoKey / KeyObject natively supported in Node 16+
    const publicKey = crypto.createPublicKey({
      key: matchingKey as any,
      format: "jwk",
    });

    const verify = crypto.createVerify("SHA256");
    verify.update(`${headerB64}.${payloadB64}`);
    const isValidSignature = verify.verify(
      publicKey,
      Buffer.from(signatureB64, "base64url"),
    );

    if (!isValidSignature) {
      throw new Error("Apple ID token signature verification failed");
    }

    // Validate claims
    if (payload.iss !== "https://appleid.apple.com") {
      throw new Error(`Invalid token issuer: ${payload.iss}`);
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Apple ID token is expired");
    }

    if (allowedAudiences && allowedAudiences.length > 0) {
      const tokenAud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const hasMatchingAud = tokenAud.some((aud: string) =>
        allowedAudiences.includes(aud),
      );
      if (!hasMatchingAud) {
        throw new Error(
          `Invalid token audience ${JSON.stringify(payload.aud)}. Expected one of: ${allowedAudiences.join(", ")}`,
        );
      }
    }

    return payload as T;
  }
}
