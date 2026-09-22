"use client";

import { ThemeProvider } from "@instanct/contexts";
import "@/i18n";
import { DocumentMetaSync } from "@/components/document-meta-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <DocumentMetaSync />
      {children}
    </ThemeProvider>
  );
}
