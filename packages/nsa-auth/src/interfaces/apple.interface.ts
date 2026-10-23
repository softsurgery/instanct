export interface AppleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export interface AppleClientSecretConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKey?: string;
  privateKeyPath?: string;
  expiresInSeconds?: number;
}

export interface AppleJWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface AppleJWKSResponse {
  keys: AppleJWK[];
}

export interface AppleIdTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: boolean | "true" | "false";
  is_private_email?: boolean | "true" | "false";
  real_user_status?: number;
  nonce?: string;
}

export interface AppleUserIdentity {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  isPrivateEmail?: boolean;
}
