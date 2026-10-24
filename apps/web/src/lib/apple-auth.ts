import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface AppleClientSecretConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKey?: string;
  privateKeyPath?: string;
  expiresInSeconds?: number;
}

export class AppleAuthWebUtils {
  public static resolvePrivateKey(
    privateKey?: string,
    privateKeyPath?: string,
  ): string {
    if (privateKey && privateKey.trim().length > 0) {
      let key = privateKey.trim();
      if (key.includes("\\n")) {
        key = key.replace(/\\n/g, "\n");
      }
      if (key.includes("BEGIN PRIVATE KEY")) {
        return key;
      }
      return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
    }

    if (privateKeyPath && privateKeyPath.trim().length > 0) {
      const resolvedPath = path.isAbsolute(privateKeyPath)
        ? privateKeyPath
        : path.resolve(
            /* turbopackIgnore: true */ process.cwd(),
            privateKeyPath,
          );

      if (fs.existsSync(resolvedPath)) {
        return fs.readFileSync(resolvedPath, "utf8").trim();
      }
    }

    const fallbackPath = path.resolve(
      process.cwd(),
      "../../env/AuthKey_CM4NR9YR9G.p8",
    );
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, "utf8").trim();
    }

    throw new Error(
      "Apple private key (.p8) could not be resolved. Please set APPLE_PRIVATE_KEY or APPLE_PRIVATE_KEY_PATH.",
    );
  }

  public static generateClientSecret(config: AppleClientSecretConfig): string {
    const {
      clientId,
      teamId,
      keyId,
      privateKey,
      privateKeyPath,
      expiresInSeconds = 5 * 60 * 60,
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

    const signature = sign.sign(
      {
        key: keyPem,
        dsaEncoding: "ieee-p1363",
      },
      "base64url",
    );

    return `${signingInput}.${signature}`;
  }
}
