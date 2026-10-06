"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@instanct/contexts";
import i18n from "@/i18n";
import { DocumentMetaSync } from "@/components/document-meta-sync";
import { DataProvider } from "@/contexts/data-context";

export function Providers({
  children,
  lng,
}: {
  children: React.ReactNode;
  lng: string;
}) {
  if (i18n.resolvedLanguage !== lng) {
    void i18n.changeLanguage(lng);
  }

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <DocumentMetaSync />
        <DataProvider>{children}</DataProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
