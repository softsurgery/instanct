import { createAxios, type CreateAxiosConfig } from "./axios";
import { createResources } from "./resources";

export type CreateApiClientConfig = CreateAxiosConfig;

export function createApiClient(config: CreateApiClientConfig) {
  const http = createAxios(config);
  return { http, ...createResources(http) };
}

export { createAxios } from "./axios";
export type { CreateAxiosConfig } from "./axios";
export { createResources } from "./resources";
export type { ApiResources } from "./resources";
export type { AuthResource } from "./resources/auth";
export type { ContentPageResource } from "./resources/content";
export type { UserResource } from "./resources/users";
export type { RoleResource } from "./resources/roles";
export type { PermissionResource } from "./resources/permission";
export type { UploadResource } from "./resources/storage";
export * from "./types";
