import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkipToContent } from "@/components/skip-to-content";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Instanct — Discover, connect, and feel at home in your community.",
    template: "%s · Instanct",
  },
  description:
    "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Instanct",
    description:
      "Instanct helps people discover nearby professionals, start sessions, and build meaningful connections with confidence.",
    siteName: "Instanct",
    type: "website",
  },
};

const themeInit = `(function(){try{var k="theme";var t=localStorage.getItem(k);var theme=t==="light"||t==="dark"||t==="system"?t:"dark";var resolved=theme==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):theme;var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(resolved);r.style.colorScheme=resolved;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
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
