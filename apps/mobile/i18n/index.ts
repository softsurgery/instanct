import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import arCommon from "./locales/ar/common.json";
import enCommon from "./locales/en/common.json";
import frCommon from "./locales/fr/common.json";

// import arNotifications from "./locales/ar/notifications.json";
import enNotifications from "./locales/en/notifications.json";
import frNotifications from "./locales/fr/notifications.json";

import enSettings from "./locales/en/settings.json";
import frSettings from "./locales/fr/settings.json";

import enExplore from "./locales/en/explore.json";
import frExplore from "./locales/fr/explore.json";

import enMenu from "./locales/en/menu.json";
import frMenu from "./locales/fr/menu.json";

import enActivities from "./locales/en/activities.json";
import frActivities from "./locales/fr/activities.json";

import enScreens from "./locales/en/screens.json";
import frScreens from "./locales/fr/screens.json";

import { chatI18nResources } from "@softsurgery/chat-materials/i18n";

import enAuth from "./locales/en/auth.json";
import frAuth from "./locales/fr/auth.json";

const resources = {
  en: {
    common: enCommon,
    notifications: enNotifications,
    settings: enSettings,
    explore: enExplore,
    menu: enMenu,
    activities: enActivities,
    screens: enScreens,
    ...chatI18nResources.en,
    auth: enAuth,
  },
  fr: {
    common: frCommon,
    notifications: frNotifications,
    settings: frSettings,
    explore: frExplore,
    menu: frMenu,
    activities: frActivities,
    ...chatI18nResources.fr,
    screens: frScreens,
    auth: frAuth,
  },
  // ar: {
  //   common: arCommon,
  //   notifications: arNotifications,
  // },
};

const locales = Localization.getLocales();
const languageCode = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: languageCode,
  fallbackLng: "en",
  ns: [
    "screens",
    "common",
    "notifications",
    "settings",
    "explore",
    "menu",
    "activities",
    "chat",
    "auth",
  ],
  defaultNS: "screens",
  interpolation: { escapeValue: false },
});

export default i18n;
