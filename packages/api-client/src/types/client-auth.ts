import type { OAuthProvider } from "./auth";
import type { ResponseUserDto } from "./user-management";

export interface ResponseClientSigninDto {
  access_token: string;
  refresh_token: string;
}

export interface RequestClientSignInDto {
  email: string;
  password: string;
  device?: string;
  os?: string;
  macAddress?: string;
}

export interface RequestClientSignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface ResponseClientSignupDto {
  user: ResponseUserDto;
}

export interface RequestSpecializedClientSignUpDto extends RequestClientSignUpDto {
  industries: number[];
  pictureId?: number;
}

export interface RequestClientUpdateMailDto {
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface RequestClientUpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RequestClientVerifyEmailDto {
  email?: string;
  callbackUrl?: string;
}

export interface RequestClientOAuthDto {
  provider: OAuthProvider;
  idToken: string;
  redirectUri?: string;
  codeVerifier?: string;
  device?: string;
  os?: string;
  macAddress?: string;
}
