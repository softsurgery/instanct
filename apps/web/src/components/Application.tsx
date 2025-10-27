import React from "react";
import { AppProps } from "next/app";
import { Layout } from "./layout/Layout";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useRouter } from "next/router";
import { Toaster } from "./ui/sonner";
import { AuthTokenSync } from "./auth/AuthTokenSync";
import { SessionProvider } from "next-auth/react";

interface ApplicationProps {
  className?: string;
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
}

const queryClient = new QueryClient();

function Application({
  className,
  Component,
  pageProps: { session, ...pageProps },
}: ApplicationProps) {
  const router = useRouter();
  return (
    <SessionProvider session={session}>
      <AuthTokenSync />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          {router.pathname === "/auth" ? (
            <Component {...pageProps} />
          ) : (
            <Layout className={cn(className)}>
              <Component {...pageProps} />
            </Layout>
          )}
        </QueryClientProvider>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default Application;
