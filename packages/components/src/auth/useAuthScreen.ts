import { useCallback, useMemo, useState } from "react";

export type AuthScreen =
  | "login"
  | "sign-up"
  | "forgot-password"
  | "reset-password";

const AUTH_SCREENS: AuthScreen[] = [
  "login",
  "sign-up",
  "forgot-password",
  "reset-password",
];

function isAuthScreen(value: string | null): value is AuthScreen {
  return AUTH_SCREENS.includes(value as AuthScreen);
}

function readSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function useAuthScreen() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  const searchParams = useMemo(() => readSearchParams(), []);
  const targetParam = searchParams.get("target");
  const token = searchParams.get("token");

  const requestedScreen = isAuthScreen(targetParam) ? targetParam : "login";
  const screen: AuthScreen =
    requestedScreen === "reset-password" || token
      ? token
        ? "reset-password"
        : "login"
      : requestedScreen;

  const goTo = (next: AuthScreen, extra?: Record<string, string>) => {
    const params = new URLSearchParams(next === "login" ? {} : { target: next, ...extra });
    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", url);
    refresh();
  };

  const clearParams = () => {
    window.history.replaceState({}, "", window.location.pathname);
    refresh();
  };

  return { screen, token, goTo, clearParams };
}
