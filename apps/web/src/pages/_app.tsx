import React from "react";
import type { AppProps } from "next/app";
import Application from "@/components/Application";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config.mjs";
import "@/styles/globals.css";
import "@instanct/ui/components/video.css";
import "@instanct/ui/components/editor/style.css";
import { SessionProvider } from "next-auth/react";
import { AuthTokenSync } from "@/components/auth/AuthTokenSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, ThemeProvider } from "@instanct/contexts";
import { api } from "@/lib/api";

const inter = { className: "font-inter" };
const queryClient = new QueryClient();

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <React.Fragment>
      <Head>
        <title>Instanct Backoffice</title>
        <meta name="description" content="Instanct Backoffice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <AuthTokenSync />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider value={{ appType: "admin", api }}>
              <Application
                Component={Component}
                pageProps={pageProps}
                className={inter.className}
              />
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </React.Fragment>
  );
};

export default appWithTranslation(App, nextI18nextConfig);
