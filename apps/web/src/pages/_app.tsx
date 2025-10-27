import React from "react";
import type { AppProps } from "next/app";
import Application from "@/components/Application";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config.mjs";
import "@/styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <React.Fragment>
      <Head>
        <title>Instanct Backoffice</title>
        <meta name="description" content="Instanct Backoffice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Application Component={Component} pageProps={pageProps} />
    </React.Fragment>
  );
};

export default appWithTranslation(App, nextI18nextConfig);
