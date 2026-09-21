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
  const clearRoutes = React.useCallback(() => {
    setRoutes([]);
  }, []);
  const breadcrumbContext = React.useMemo(
    () => ({
      routes,
      setRoutes,
      clearRoutes,
    }),
    [routes, clearRoutes],
  );

  const [content, setContent] = React.useState<React.ReactNode>(null);
  const clearContent = React.useCallback(() => {
    setContent(null);
  }, []);
  const footerContext = React.useMemo(
    () => ({
      content,
      setContent,
      clearContent,
    }),
    [content, clearContent],
  );

  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [floating, setFloating] = React.useState<React.ReactNode>(null);

  const setIntro = React.useCallback((newTitle: string, newDescription?: string) => {
    setTitle(newTitle);
    setDescription(newDescription || "");
  }, []);

  const clearIntro = React.useCallback(() => {
    setTitle("");
    setDescription("");
  }, []);

  const clearFloating = React.useCallback(() => {
    setFloating(null);
  }, []);

  const introContext = React.useMemo(
    () => ({
      title,
      description,
      floating,
      setIntro,
      setFloating,
      clearIntro,
      clearFloating,
    }),
    [
      title,
      description,
      floating,
      setIntro,
      setFloating,
      clearIntro,
      clearFloating,
    ],
  );

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
