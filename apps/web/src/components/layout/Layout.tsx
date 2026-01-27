import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import React from "react";
import {
  BreadcrumbContext,
  BreadcrumbRoute,
} from "@/contexts/BreadcrumbContext";
import { PageHeader } from "./PageHeader";
import { IntroContext } from "@/contexts/IntroContext";
import { FooterContext } from "@/contexts/FooterContext";
import { Footer } from "./Footer";
import { SidebarProvider } from "../ui/sidebar";
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
    <SidebarProvider>
      <BreadcrumbContext.Provider value={breadcrumbContext}>
        <IntroContext.Provider value={introContext}>
          <FooterContext.Provider value={footerContext}>
            <div
              className={cn(
                "grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]",
                className,
              )}
            >
              {/* Sidebar */}
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* header */}
                <Header />
                {(title || description) && (
                  <PageHeader
                    className={cn("pt-5", isMobile ? "px-4" : "px-10")}
                  />
                )}
                <main className="flex flex-col flex-1 overflow-hidden gap-4 px-4 lg:gap-6 lg:px-6">
                  {children}
                </main>
                {content && <Footer />}
              </div>
            </div>
          </FooterContext.Provider>
        </IntroContext.Provider>
      </BreadcrumbContext.Provider>
    </SidebarProvider>
  );
};
