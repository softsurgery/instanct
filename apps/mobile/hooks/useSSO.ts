import React from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { useApi } from "@/contexts/ApiContext";
import { OAuthProvider, ServerErrorResponse } from "@softsurgery/api-client";
import { Platform } from "react-native";

// Ensure web browser redirect is handled properly
WebBrowser.maybeCompleteAuthSession();

// ─── Google OAuth Configuration ────────────────────────────────────────
// Using platform-specific environment variables, fallback to generic
const GOOGLE_CLIENT_ID =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    : Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
      : process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

// ─── LinkedIn OAuth Configuration ──────────────────────────────────────
const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID;

const linkedInDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
  tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
};

// ─── Apple OAuth Configuration ─────────────────────────────────────────
const APPLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || "com.instanct.instanctma";

const appleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
  tokenEndpoint: "https://appleid.apple.com/auth/token",
};

export function useSSO() {
  const api = useApi();
  const [isAppleAvailable, setIsAppleAvailable] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync()
        .then(setIsAppleAvailable)
        .catch(() => setIsAppleAvailable(false));
    }
  }, []);

  // We need two redirect URIs:
  // 1. backendRedirectUri: Sent to OAuth providers so they redirect to our backend server.
  // 2. deepLinkUri: The app's deep link, which WebBrowser waits for to close automatically.
  const backendRedirectUri =
    process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI ?? "exp://";
  const deepLinkUri = AuthSession.makeRedirectUri({ path: "oauth" });

  // ── Google Auth Request ────────────────────────────────────────────
  const [googleRequest, , googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID ?? "",
      redirectUri: deepLinkUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    googleDiscovery,
  );

  // ── LinkedIn Auth Request ──────────────────────────────────────────
  const [linkedInRequest, , linkedInPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: LINKEDIN_CLIENT_ID ?? "",
      redirectUri: deepLinkUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
    },
    linkedInDiscovery,
  );

  // ── Apple Auth Request (iOS fallback) ──────────────────────────────
  const [appleRequest, , applePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: APPLE_CLIENT_ID,
      redirectUri: deepLinkUri,
      scopes: ["name", "email"],
      responseType: AuthSession.ResponseType.IdToken,
    },
    appleDiscovery,
  );

  // ── SSO Mutation ───────────────────────────────────────────────────
  const { mutate: performSSOSignIn, isPending } = useMutation({
    mutationFn: async ({
      provider,
      idToken,
      codeVerifier,
      redirectUri,
    }: {
      provider: OAuthProvider;
      idToken: string;
      codeVerifier?: string;
      redirectUri?: string;
    }) => {
      return api.clientAuth.ssoSignIn({
        provider,
        idToken,
        codeVerifier,
        redirectUri,
      });
    },
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          "SSO sign-in failed. Please try again.",
      );
    },
  });

  // Helper to modify the auth URL to point to the backend
  const getModifiedUrl = React.useCallback(
    async (
      request: AuthSession.AuthRequest | null,
      discovery: AuthSession.DiscoveryDocument,
    ) => {
      if (!request) return null;
      let authUrl = await request.makeAuthUrlAsync(discovery);

      // Inject the deepLinkUri into the state parameter so the backend knows where to redirect
      const stateMatch = authUrl.match(/[\?&]state=([^&]+)/);
      if (stateMatch) {
        const originalState = decodeURIComponent(stateMatch[1]);
        const newState = encodeURIComponent(`${originalState}|${deepLinkUri}`);
        authUrl = authUrl.replace(
          `state=${stateMatch[1]}`,
          `state=${newState}`,
        );
      }

      // We pass the backend URL to the provider so it redirects to our backend,
      // but AuthSession expects the deepLinkUri to close the browser.
      return authUrl.replace(
        encodeURIComponent(deepLinkUri),
        encodeURIComponent(backendRedirectUri),
      );
    },
    [backendRedirectUri, deepLinkUri],
  );

  // ── Google Sign-In ─────────────────────────────────────────────────
  const signInWithGoogle = React.useCallback(async () => {
    try {
      if (!googleRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        googleRequest,
        googleDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await googlePromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success") {
        const code = result.params?.code;
        const codeVerifier = googleRequest?.codeVerifier;
        if (code) {
          performSSOSignIn({
            provider: OAuthProvider.GOOGLE,
            idToken: code,
            codeVerifier,
            redirectUri: backendRedirectUri,
          });
        } else {
          toast.error("Failed to obtain Google credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Google sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with Google sign-in.");
    }
  }, [
    googlePromptAsync,
    googleRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

  // ── LinkedIn Sign-In ───────────────────────────────────────────────
  const signInWithLinkedIn = React.useCallback(async () => {
    try {
      if (!linkedInRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        linkedInRequest,
        linkedInDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await linkedInPromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success" && result.params?.code) {
        // LinkedIn returns an authorization code;
        // send it to the backend which exchanges it for an access token
        performSSOSignIn({
          provider: OAuthProvider.LINKEDIN,
          idToken: result.params.code,
          redirectUri: backendRedirectUri,
        });
      } else if (result.type === "error") {
        toast.error(result.error?.message || "LinkedIn sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with LinkedIn sign-in.");
    }
  }, [
    linkedInPromptAsync,
    linkedInRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

  // ── Apple Sign-In (iOS only) ───────────────────────────────────────
  const signInWithApple = React.useCallback(async () => {
    if (Platform.OS !== "ios") return;

    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (isAvailable) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          performSSOSignIn({
            provider: OAuthProvider.APPLE,
            idToken: credential.identityToken,
            redirectUri: backendRedirectUri,
          });
        } else {
          toast.error("Failed to obtain Apple credentials.");
        }
        return;
      }

      // Fallback for environments where native Apple auth isn't available
      if (!appleRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        appleRequest,
        appleDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await applePromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success") {
        const idToken = result.params?.id_token;
        if (idToken) {
          performSSOSignIn({
            provider: OAuthProvider.APPLE,
            idToken,
            redirectUri: backendRedirectUri,
          });
        } else {
          toast.error("Failed to obtain Apple credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Apple sign-in was cancelled.");
      }
    } catch (error: any) {
      if (error?.code === "ERR_REQUEST_CANCELED") {
        // User cancelled the native Apple sign-in sheet
        return;
      }
      toast.error("An unexpected error occurred with Apple sign-in.");
    }
  }, [
    applePromptAsync,
    appleRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

  return {
    isPending,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithApple,
    // Expose request readiness for disabling buttons
    isGoogleReady: !!googleRequest,
    isLinkedInReady: !!linkedInRequest,
    isAppleReady: Platform.OS === "ios" && (isAppleAvailable || !!appleRequest),
  };
}
