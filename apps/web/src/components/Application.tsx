import React from "react";
import { AppProps } from "next/app";
import { Layout } from "./layout/Layout";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ApplicationProps {
  className?: string;
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
}

const queryClient = new QueryClient();

function Application({ className, Component, pageProps }: ApplicationProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout className={cn(className)}>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

export default Application;
