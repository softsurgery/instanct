import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@instanct/ui";
import { useFooter, useIntro, useUI } from "@instanct/contexts";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/AppProviders";
import { cn } from "@/lib/utils";

interface LayoutProps {
  className?: string;
  children?: ReactNode;
}

function LayoutShell({ className, children }: LayoutProps) {
  const { title, description, floating } = useIntro();
  const { content } = useFooter();
  const { enableMainOverflow, showSidebar = true } = useUI();

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as CSSProperties
      }
    >
      {showSidebar ? <AppSidebar variant="inset" /> : null}
      <SidebarInset className="min-h-0 overflow-hidden">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            id="main-layout"
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-4 p-2 md:p-4",
              enableMainOverflow ? "overflow-auto" : "overflow-hidden",
              className,
            )}
          >
            {(title || description || floating) && (
              <div className="shrink-0 flex flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  {title && (
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {floating ? <div>{floating}</div> : null}
              </div>
            )}
            <div
              className={cn(
                "flex flex-col",
                enableMainOverflow
                  ? "overflow-visible"
                  : "min-h-0 flex-1 overflow-hidden",
              )}
            >
              {children}
            </div>
          </div>
          {content ? (
            <div className="shrink-0">
              <Footer />
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function Layout({ className, children }: LayoutProps) {
  return (
    <AppProviders>
      <LayoutShell className={className}>{children}</LayoutShell>
    </AppProviders>
  );
}

export default Layout;
