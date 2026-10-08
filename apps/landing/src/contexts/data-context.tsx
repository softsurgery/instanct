"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { site } from "@/lib/site";

type DataContextType = {
  contactEmail: string;
};

const DataContext = React.createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: config, isPending } = useQuery({
    queryKey: ["landing-configuration"],
    queryFn: () => api.landingConfiguration.getConfiguration(),
    staleTime: 1000 * 60 * 5,
  });

  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!isPending && minTimeElapsed && showSplash && !isFadingOut) {
      const startFadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setShowSplash(false);
        }, 500);
      }, 0);
      return () => clearTimeout(startFadeTimer);
    }
  }, [isPending, minTimeElapsed, showSplash, isFadingOut]);

  const contactEmail = config?.contactEmail || site.urls.contact;

  return (
    <DataContext.Provider value={{ contactEmail }}>
      {showSplash && (
        <div
          className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Image
            src="/logo.png"
            alt="Instanct logo"
            width={120}
            height={120}
            priority
          />
        </div>
      )}
      {!isPending && children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
