import React from "react";
import type { AppProps } from "next/app";
import Application from "@/components/Application";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import "@/styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => {
  return <Application Component={Component} pageProps={pageProps} />;
};

export default appWithTranslation(App, nextI18nextConfig);
