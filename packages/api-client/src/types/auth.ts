import type { ResponseUserDto } from "./user-management";

export interface SigninPayload {
  usernameOrEmail: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
}

export interface OAuthRequestDto {
  provider: OAuthProvider;
  idToken: string;
}

export type OAuthPayload = OAuthRequestDto;

export interface ResponseSigninDto {
  user: ResponseUserDto;
  access_token: string;
  refresh_token: string;
}

export interface ResponseSignupDto {
  user: ResponseUserDto;
}
