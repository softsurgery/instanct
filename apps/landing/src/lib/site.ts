export const site = {
  name: "Instanct",
  tagline: "Discover, connect, and feel at home in your community.",
  description:
    "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
  urls: {
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "",
    playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "",
    web: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000",
    contact: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@instanct.com",
  },
};

export const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const features = [
  {
    title: "Nearby discovery",
    description:
      "Explore professionals around you on a live map. Filter by industry and objectives to find people who match what you are looking for.",
    icon: "map",
  },
  {
    title: "Profiles that go further",
    description:
      "Showcase experience, education, industries, and intent so the right people can find you — and you can find them.",
    icon: "profile",
  },
  {
    title: "Real-time messaging",
    description:
      "Chat with networking contacts, share media, and send a poke when a lightweight hello is all you need.",
    icon: "chat",
  },
  {
    title: "Sessions",
    description:
      "Share when you are available to connect. Others nearby can see you are open, then start a conversation with context.",
    icon: "session",
  },
  {
    title: "Meeting requests",
    description:
      "Send or receive meeting requests with a time and place. Accepted meetings land on your schedule automatically.",
    icon: "request",
  },
  {
    title: "Bookmarks & activities",
    description:
      "Save interesting profiles, keep incoming and outgoing requests in one place, and stay on top of what matters today.",
    icon: "bookmark",
  },
] as const;

export const steps = [
  {
    step: "01",
    title: "Create your profile",
    description:
      "Add your photo, bio, experience, education, and industries. Sign in with email, Google, Apple, or LinkedIn.",
  },
  {
    step: "02",
    title: "Explore who is nearby",
    description:
      "Open the map, apply filters, and discover people around you who share your objectives or industry.",
  },
  {
    step: "03",
    title: "Connect with confidence",
    description:
      "Start a session, send a meeting request, or open a chat. Instanct is built for connections that feel human-first.",
  },
] as const;

export const safetyPoints = [
  {
    title: "Privacy first",
    description:
      "Location is only used when you enable it, to power map and nearby features. You control visibility from Settings.",
  },
  {
    title: "Community standards",
    description:
      "Harassment, impersonation, and harmful content are not allowed. We can suspend accounts that break these terms.",
  },
  {
    title: "You own your content",
    description:
      "You own what you share. Instanct only hosts and displays it to operate the service, and you can delete your account at any time.",
  },
] as const;

export const faqs = [
  {
    question: "What is Instanct?",
    answer:
      "Instanct is a professional discovery app. It helps people find nearby professionals, start sessions, send meeting requests, and chat — with privacy and trust at the core.",
  },
  {
    question: "Is my location always shared?",
    answer:
      "No. Location data is collected only when enabled, to power map and nearby features. You can manage visibility and preferences in Settings.",
  },
  {
    question: "How do sessions work?",
    answer:
      "A session tells others you are available to connect. You choose when it starts and ends so people nearby understand your intent before they reach out.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "The Instanct experience is built for iOS and Android. A web backoffice exists for administration. The product is available in English, French, and Arabic.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Open Settings, then Session, and choose Remove Account. Account deletion permanently removes your data and cannot be undone.",
  },
] as const;
