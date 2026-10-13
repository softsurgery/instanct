import { createAxios, type CreateAxiosConfig } from "./axios";
import { createResources } from "./resources";

export type CreateApiClientConfig = CreateAxiosConfig;

export function createApiClient(config: CreateApiClientConfig) {
  const http = createAxios(config);
  return { http, ...createResources(http) };
}

export { createAxios } from "./axios";
export type { AxiosAuthAdapter, CreateAxiosConfig } from "./axios";
export { createResources } from "./resources";
export type { ApiResources } from "./resources";
export type { AuthResource } from "./resources/auth";
export type { BookmarkResource } from "./resources/bookmark";
export type { ChatResource } from "./resources/chat";
export type { ClientAuthResource } from "./resources/client-auth";
export type { CurrentUserResource } from "./resources/current-user";
export type { DevicesResource } from "./resources/devices";
export type { RequestResource } from "./resources/request";
export type { SessionResource } from "./resources/session";
export type { ContentPageResource } from "./resources/content";
export type { UserResource } from "./resources/users";
export type { RoleResource } from "./resources/roles";
export type { PermissionResource } from "./resources/permission";
export type { UploadResource } from "./resources/storage";
export type { LandingConfigurationResource } from "./resources/landing-configuration";
export * from "./types";
