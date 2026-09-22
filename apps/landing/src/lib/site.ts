export const site = {
  name: "Instanct",
  urls: {
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "",
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "",
    web: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000",
    contact: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@instanct.com",
  },
};

export const navLinks = [
  { href: "/#features", labelKey: "nav.features" },
  { href: "/#how-it-works", labelKey: "nav.howItWorks" },
  { href: "/#safety", labelKey: "nav.safety" },
  { href: "/#faq", labelKey: "nav.faq" },
] as const;

export const featureItems = [
  { icon: "map", key: "nearbyDiscovery" },
  { icon: "profile", key: "profiles" },
  { icon: "chat", key: "messaging" },
  { icon: "session", key: "sessions" },
  { icon: "request", key: "meetingRequests" },
  { icon: "bookmark", key: "bookmarks" },
] as const;

export const stepKeys = ["01", "02", "03"] as const;

export const safetyPointKeys = ["privacy", "community", "content"] as const;

export const faqKeys = [
  "whatIsInstanct",
  "location",
  "sessions",
  "platforms",
  "deleteAccount",
] as const;

export const showcaseHighlightKeys = [
  "filters",
  "sessions",
  "chat",
  "languages",
] as const;

export const showcaseCardKeys = [
  "explore",
  "sessions",
  "requests",
  "chat",
] as const;
