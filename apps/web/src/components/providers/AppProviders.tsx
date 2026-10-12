import React, { useState, useCallback, useMemo } from "react";
import {
  BreadcrumbContext,
  FooterContext,
  IntroContext,
  UIProvider,
  type BreadcrumbRoute,
} from "@instanct/contexts";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [routes, setRoutes] = useState<BreadcrumbRoute[]>([]);
  const clearRoutes = useCallback(() => {
    setRoutes((prev) => (prev.length === 0 ? prev : []));
  }, []);
  const breadcrumbContext = useMemo(
    () => ({
      routes,
      setRoutes,
      clearRoutes,
    }),
    [routes, clearRoutes],
  );

  const [content, setContent] = useState<React.ReactNode>(null);
  const clearContent = useCallback(() => {
    setContent((prev) => (prev === null ? prev : null));
  }, []);
  const footerContext = useMemo(
    () => ({
      content,
      setContent,
      clearContent,
    }),
    [content, clearContent],
  );

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [floating, setFloating] = useState<React.ReactNode>(null);

  const setIntro = useCallback((newTitle: string, newDescription?: string) => {
    setTitle((prev) => (prev === newTitle ? prev : newTitle));
    const desc = newDescription || "";
    setDescription((prev) => (prev === desc ? prev : desc));
  }, []);

  const clearIntro = useCallback(() => {
    setTitle((prev) => (prev === "" ? prev : ""));
    setDescription((prev) => (prev === "" ? prev : ""));
  }, []);

  const clearFloating = useCallback(() => {
    setFloating((prev) => (prev === null ? prev : null));
  }, []);

  const introContext = useMemo(
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

  return (
    <UIProvider>
      <BreadcrumbContext.Provider value={breadcrumbContext}>
        <IntroContext.Provider value={introContext}>
          <FooterContext.Provider value={footerContext}>
            {children}
          </FooterContext.Provider>
        </IntroContext.Provider>
      </BreadcrumbContext.Provider>
    </UIProvider>
  );
}

export default AppProviders;
