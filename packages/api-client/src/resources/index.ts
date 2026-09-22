import type { AxiosInstance } from "axios";
import { createAuthResource } from "./auth";
import { createConfigurationResource } from "./configuration";
import { createContentPageResource } from "./content";
import { createEducationResource } from "./education";
import { createExperienceResource } from "./experience";
import { createFollowResource } from "./follow";
import { createLoggerResource } from "./logger";
import { createNotificationResource } from "./notification";
import { createPermissionResource } from "./permission";
import { createRefImplResource } from "./ref-impl";
import { createRefParamResource } from "./ref-param";
import { createRefTypeResource } from "./ref-type";
import { createRoleResource } from "./roles";
import { createStoreResource } from "./store";
import { createUploadResource } from "./storage";
import { createUserResource } from "./users";

export function createResources(http: AxiosInstance) {
  return {
    auth: createAuthResource(http),
    admin: {
      logger: createLoggerResource(http),
      permission: createPermissionResource(http),
      refParam: createRefParamResource(http),
      refType: createRefTypeResource(http),
      role: createRoleResource(http),
      user: createUserResource(http),
      configuration: createConfigurationResource(http),
      contentPage: createContentPageResource(http),
    },
    store: createStoreResource(http),
    contentPage: createContentPageResource(http),
    upload: createUploadResource(http),
    notification: createNotificationResource(http),
    follow: createFollowResource(http),
    experience: createExperienceResource(http),
    education: createEducationResource(http),
    refImpl: createRefImplResource(http),
  };
}

export type ApiResources = ReturnType<typeof createResources>;
