import React from "react";
import type { AppProps } from "next/app";
import Application from "@/components/Application";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config.mjs";
import "@/styles/globals.css";
import "@softsurgery/ui/components/video.css";
import "@softsurgery/ui/components/editor/style.css";
import { SessionProvider } from "next-auth/react";
import { AuthTokenSync } from "@/components/auth/AuthTokenSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, ThemeProvider } from "@softsurgery/contexts";
import { api } from "@/lib/api";

const inter = { className: "font-inter" };
const queryClient = new QueryClient();

const App = ({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps) => {
  return (
    <React.Fragment>
      <Head>
        <title>Instanct Backoffice</title>
        <meta name="description" content="Instanct Backoffice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </Head>
      <SessionProvider session={session}>
        <AuthTokenSync />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider value={{ appType: "admin", api }}>
              <Application
                Component={Component}
                pageProps={pageProps}
                className={inter.className}
                router={router}
              />
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </React.Fragment>
  );
};

export default appWithTranslation(App, nextI18nextConfig);
