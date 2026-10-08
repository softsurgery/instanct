import React from "react";
import { AppProps } from "next/app";
import { useSession } from "next-auth/react";
import { Layout } from "./layout/Layout";
import { cn } from "@/lib/utils";
import { Toaster } from "@instanct/ui";
import { Spinner } from "@instanct/components";
import { NextRouter } from "next/router";

interface ApplicationProps {
  className?: string;
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
  router: NextRouter;
}

const publicRoutes = ["/auth"];
const protectedHome = "/";

function Application({
  className,
  Component,
  pageProps,
  router,
}: ApplicationProps) {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = React.useState(false);

  const isAuthPage = publicRoutes.some((route) =>
    router.pathname.startsWith(route),
  );
  const isProtectedRoute = !isAuthPage;

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    if (status === "loading") return;

    if (isAuthPage && session) {
      router.replace(protectedHome);
    }

    if (isProtectedRoute && !session) {
      router.replace("/auth");
    }
  }, [status, session, isAuthPage, isProtectedRoute, router]);

  const shouldBlockRender =
    !hasMounted ||
    status === "loading" ||
    (isAuthPage && session) ||
    (isProtectedRoute && !session);

  if (shouldBlockRender) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <>
      <div
        className={cn(
          `flex flex-col flex-1 overflow-hidden min-h-screen max-h-screen`,
          className,
        )}
      >
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </div>
      <Toaster position="bottom-left" />
    </>
  );
}

export default Application;
