import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { useMediaQuery } from "@instanct/ui";
import React from "react";
import { BreadcrumbContext } from "@instanct/contexts";
import type { BreadcrumbRoute } from "@instanct/contexts";
import { PageHeader } from "./PageHeader";
import { IntroContext } from "@instanct/contexts";
import { FooterContext } from "@instanct/contexts";
import { Footer } from "./Footer";
import { SidebarInset, SidebarProvider } from "@instanct/ui";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  className?: string;
  children?: React.ReactNode;
}

export const Layout = ({ className, children }: LayoutProps) => {
  const [routes, setRoutes] = React.useState<BreadcrumbRoute[]>([]);
  const breadcrumbContext = {
    routes,
    setRoutes,
    clearRoutes: () => {
      setRoutes?.([]);
    },
  };

  const [content, setContent] = React.useState<React.ReactNode>(null);
  const footerContext = {
    content,
    setContent,
    clearContent: () => {
      setContent?.(null);
    },
  };

  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [floating, setFloating] = React.useState<React.ReactNode>(null);
  const introContext = {
    title,
    description,
    floating,
    setIntro: (title: string, description?: string) => {
      setTitle(title);
      setDescription(description || "");
    },
    setFloating,
    clearIntro: () => {
      setTitle("");
      setDescription("");
    },
    clearFloating: () => {
      setFloating(null);
    },
  };

  const isMobile = useMediaQuery("(max-width: 425px)");
  return (
    <div className={cn("flex overflow-hidden fullscreen", className)}>
      <SidebarProvider className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <BreadcrumbContext.Provider value={breadcrumbContext}>
          <IntroContext.Provider value={introContext}>
            <FooterContext.Provider value={footerContext}>
              <AppSidebar />
              <SidebarInset className="min-h-0 overflow-hidden">
                <Header />
                {(title || description) && (
                  <PageHeader
                    className={cn("py-5", isMobile ? "px-4" : "px-10")}
                  />
                )}
                <div
                  className={cn(
                    "flex min-h-0 flex-1 flex-col overflow-hidden",
                    isMobile ? "px-4" : "px-10",
                    className,
                  )}
                >
                  {children}
                </div>
                {content && <Footer />}
              </SidebarInset>
            </FooterContext.Provider>
          </IntroContext.Provider>
        </BreadcrumbContext.Provider>
      </SidebarProvider>
    </div>
  );
};
