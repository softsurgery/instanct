import React from "react";
import type { AppProps } from "next/app";
import Application from "@/components/Application";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
      <Application Component={Component} pageProps={pageProps} />
  );
}
