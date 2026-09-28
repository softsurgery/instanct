import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkipToContent } from "@/components/skip-to-content";
import { headers } from "next/headers";
import { resolveSupportedLng } from "@/i18n/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://instanct.com",
  ),
  title: {
    default:
      "Instanct — Discover, connect, and feel at home in your community.",
    template: "%s · Instanct",
  },
  description:
    "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
  keywords: [
    "Instanct",
    "community",
    "professionals",
    "connections",
    "networking",
    "local discovery",
  ],
  authors: [{ name: "Instanct Team", url: "https://instanct.com" }],
  creator: "Instanct",
  publisher: "Instanct",
  applicationName: "Instanct",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Instanct",
    description:
      "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
    url: "/",
    siteName: "Instanct",
    type: "website",
    locale: "fr-FR",
  },
};

const themeInit = `(function(){try{var k="theme";var t=localStorage.getItem(k);var theme=t==="light"||t==="dark"||t==="system"?t:"dark";var resolved=theme==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):theme;var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(resolved);r.style.colorScheme=resolved;}catch(e){}})();`;

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Instanct",
  url: "https://instanct.com",
  description:
    "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
  publisher: {
    "@type": "Organization",
    name: "Instanct",
    logo: {
      "@type": "ImageObject",
      url: "https://instanct.com/logo.png",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  const resolvedLng = resolveSupportedLng(acceptLanguage);

  return (
    <html
      lang={resolvedLng}
      suppressHydrationWarning
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <Providers>
          <SkipToContent />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
