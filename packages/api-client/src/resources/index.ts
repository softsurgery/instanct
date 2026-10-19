import type { AxiosInstance } from "axios";
import { createAuthResource } from "./auth";
import { createBookmarkResource } from "./bookmark";
import { createChatResource } from "./chat";
import { createClientAuthResource } from "./client-auth";
import { createLandingConfigurationResource } from "./landing-configuration";
import { createConfigurationResource } from "./configuration";
import { createContentPageResource } from "./content";
import { createCurrentUserResource } from "./current-user";
import { createUserDevicesResource } from "./user-devices";
import { createUserDeviceHistoryResource } from "./user-device-history";
import { createEducationResource } from "./education";
import { createExperienceResource } from "./experience";
import { createFollowResource } from "./follow";
import { createLoggerResource } from "./logger";
import { createNotificationResource } from "./notification";
import { createPermissionResource } from "./permission";
import { createRefImplResource } from "./ref-impl";
import { createRefParamResource } from "./ref-param";
import { createRefTypeResource } from "./ref-type";
import { createRequestResource } from "./request";
import { createRoleResource } from "./roles";
import { createSessionResource } from "./session";
import { createStoreResource } from "./store";
import { createUploadResource } from "./storage";
import { createUserResource } from "./users";
import { createBugResource } from "./bug";
import { createFeedbackResource } from "./feedback";
import { createTemplateResource } from "./template";
import { createAppVersionResource } from "./app-version";

export function createResources(http: AxiosInstance) {
  return {
    auth: createAuthResource(http),
    clientAuth: createClientAuthResource(http),
    currentUser: createCurrentUserResource(http),
    session: createSessionResource(http),
    request: createRequestResource(http),
    chat: createChatResource(http),
    bookmark: createBookmarkResource(http),
    userDevices: createUserDevicesResource(http),
    userDeviceHistory: createUserDeviceHistoryResource(http),
    admin: {
      logger: createLoggerResource(http),
      permission: createPermissionResource(http),
      refParam: createRefParamResource(http),
      refType: createRefTypeResource(http),
      role: createRoleResource(http),
      user: createUserResource(http),
      configuration: createConfigurationResource(http),
      contentPage: createContentPageResource(http),
      template: createTemplateResource(http),
      bugReport: createBugResource(http),
      feedback: createFeedbackResource(http),
    },
    store: createStoreResource(http),
    contentPage: createContentPageResource(http),
    template: createTemplateResource(http),
    upload: createUploadResource(http),
    notification: createNotificationResource(http),
    follow: createFollowResource(http),
    experience: createExperienceResource(http),
    education: createEducationResource(http),
    refImpl: createRefImplResource(http),
    landingConfiguration: createLandingConfigurationResource(http),
    appVersion: createAppVersionResource(http),
  };
}

export type ApiResources = ReturnType<typeof createResources>;
