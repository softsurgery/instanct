import * as AuthSession from "expo-auth-session";
import type {
  ClientAuthResource,
  RequestClientOAuthDto,
  RequestClientSignInDto,
  RequestClientUpdateMailDto,
  RequestClientVerifyEmailDto,
} from "@softsurgery/api-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { getClientDeviceInfo } from "@/lib/device-info";
import { getDeviceMacAddress } from "@/lib/device-mac";

const saveClientTokens = (accessToken: string, refreshToken: string) => {
  const authPersistStore = useAuthPersistStore.getState();
  authPersistStore.setAccessToken(accessToken);
  authPersistStore.setRefreshToken(refreshToken);
  authPersistStore.setAuthenticated(true);
};

const emailCallbackUrl = () =>
  AuthSession.makeRedirectUri({
    path: "main/profile/email-success",
  });

export function bindMobileClientAuth(clientAuth: ClientAuthResource) {
  return {
    ...clientAuth,
    signIn: async (payload: RequestClientSignInDto) => {
      const deviceInfo = getClientDeviceInfo();
      const macAddress = await getDeviceMacAddress();
      const response = await clientAuth.signIn({
        device: deviceInfo.device,
        os: deviceInfo.os,
        ...payload,
        macAddress: payload.macAddress || macAddress,
      });
      saveClientTokens(response.access_token, response.refresh_token);
      return response;
    },
    ssoSignIn: async (payload: RequestClientOAuthDto) => {
      const deviceInfo = getClientDeviceInfo();
      const macAddress = await getDeviceMacAddress();
      const response = await clientAuth.ssoSignIn({
        device: deviceInfo.device,
        os: deviceInfo.os,
        ...payload,
        macAddress: payload.macAddress || macAddress,
      });
      saveClientTokens(response.access_token, response.refresh_token);
      return response;
    },
    sendVerifyEmail: async (payload: RequestClientVerifyEmailDto = {}) =>
      clientAuth.sendVerifyEmail({
        ...payload,
        callbackUrl: payload.callbackUrl ?? emailCallbackUrl(),
      }),
    updateEmail: async (payload: RequestClientUpdateMailDto) =>
      clientAuth.updateEmail({
        ...payload,
        callbackUrl: payload.callbackUrl ?? emailCallbackUrl(),
      }),
  };
}
