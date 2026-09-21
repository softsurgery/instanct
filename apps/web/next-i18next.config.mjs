import HttpBackend from "i18next-http-backend/cjs";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";

const isDev = process.env.NODE_ENV === "development";

const nextI18nextConfig = {
  backend: {
    backendOptions: [
      { expirationTime: isDev ? 0 : 60 * 60 * 1000 },
      { loadPath: "/locales/{{lng}}/{{ns}}.json" },
    ],
    backends:
      typeof window !== "undefined" ? [LocalStorageBackend, HttpBackend] : [],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    defaultNS: "common",
    ns: [
      "common",
      "user-management",
      "role",
      "notifications",
      "content-management",
    ],
  },
  reloadOnPrerender: isDev,
  serializeConfig: false,
  use: typeof window !== "undefined" ? [ChainedBackend] : [],
  localeDetection: false,
};

export default nextI18nextConfig;
