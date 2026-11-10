export { ApiProvider, useApi, type ApiClient } from "./context/ApiContext";

export * from "./content/useCheckHealth";
export * from "./content/useServerUploads";
export * from "./content/useUpload";
export * from "./content/useUploads";

// Chat, notifications, geolocation, auth and app-version hooks are mobile-only
// (expo-router, expo-auth-session, expo-application, react-native, ...). Keeping them
// out of this barrel is what stops react-native from entering the Next.js module graph.
// Import from `api-client/hooks/chat`, `.../notification/useNotifications`,
// `api-client/hooks/geolocation`, `api-client/hooks/auth` or
// `api-client/hooks/useAppVersionCheck`.

export * from "./content/configurations/useConfigurationById";
export * from "./content/configurations/useConfigurationByName";
export * from "./content/configurations/useConfigurations";
export * from "./content/configurations/useGlobalMapConfiguration";

export * from "./content/configuration/useApplicationLanguages";

export * from "./content/pages/useContentPages";

export * from "./content/sessions/useActiveSessions";
export * from "./content/sessions/useInfiniteIncomingSessionRequests";
export * from "./content/sessions/useInfiniteOutgoingSessionRequests";
export * from "./content/sessions/useInfiniteUserSessions";
export * from "./content/sessions/useUserSessions";

export * from "./content/users/useBookmarkActions";
export * from "./content/users/useCurrentMapConfiguration";

export * from "./content/users/useInfinteUserBookmarks";

//************************************************************************************** */
export * from "./user-based";
export * from "./reference-types";
export * from "./storage";
