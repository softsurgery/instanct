import type { AxiosInstance } from "axios";
import type {
  RequestClientOAuthDto,
  RequestClientSignInDto,
  RequestClientUpdateMailDto,
  RequestClientUpdatePasswordDto,
  RequestClientVerifyEmailDto,
  RequestSpecializedClientSignUpDto,
  ResponseClientSigninDto,
  ResponseClientSignupDto,
} from "../types";

export function createClientAuthResource(http: AxiosInstance) {
  const signIn = async (
    payload: RequestClientSignInDto,
  ): Promise<ResponseClientSigninDto> => {
    const response = await http.post<ResponseClientSigninDto>(
      "/client-auth/sign-in",
      payload,
    );
    return response.data;
  };

  const ssoSignIn = async (
    payload: RequestClientOAuthDto,
  ): Promise<ResponseClientSigninDto> => {
    const response = await http.post<ResponseClientSigninDto>(
      "/client-auth/oauth",
      payload,
    );
    return response.data;
  };

  const signUp = async (
    payload: RequestSpecializedClientSignUpDto,
  ): Promise<ResponseClientSignupDto> => {
    const response = await http.post<ResponseClientSignupDto>(
      "/client-custom-auth/sign-up",
      payload,
    );
    return response.data;
  };

  const sendVerifyEmail = async (payload: RequestClientVerifyEmailDto) => {
    const response = await http.post("/client-auth/send-verify-email", payload);
    return response.data;
  };

  const verifyEmail = async (token: string) => {
    const response = await http.post("/client-auth/verify-email", { token });
    return response.data;
  };

  const updateEmail = async (payload: RequestClientUpdateMailDto) => {
    const response = await http.post("/client-auth/update-email", payload);
    return response.data;
  };

  const updatePassword = async (payload: RequestClientUpdatePasswordDto) => {
    const response = await http.post("/client-auth/update-password", payload);
    return response.data;
  };

  return {
    signIn,
    ssoSignIn,
    signUp,
    sendVerifyEmail,
    verifyEmail,
    updateEmail,
    updatePassword,
  };
}

export type ClientAuthResource = ReturnType<typeof createClientAuthResource>;
