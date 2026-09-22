import type { AxiosInstance } from "axios";
import type {
  OAuthPayload,
  RequestResetTokenDto,
  ResponseResetTokenDto,
  ResponseSigninDto,
  ResponseSignupDto,
  SigninPayload,
  SignupPayload,
} from "../types";

export function createAuthResource(http: AxiosInstance) {
  const signIn = async (payload: SigninPayload): Promise<ResponseSigninDto> => {
    const response = await http.post<ResponseSigninDto>("/auth/sign-in", payload);
    return response.data;
  };

  const signUp = async (payload: SignupPayload): Promise<ResponseSignupDto> => {
    const response = await http.post("/auth/sign-up", payload);
    return response.data;
  };

  const oauth = async (payload: OAuthPayload): Promise<ResponseSigninDto> => {
    const response = await http.post<ResponseSigninDto>("/auth/oauth", payload);
    return response.data;
  };

  const resetPassword = async (
    token: string,
    password: string,
  ): Promise<{ message: string }> => {
    const response = await http.post<{ message: string }>(
      `/auth/reset-password/${token}`,
      { password },
    );
    return response.data;
  };

  const forgetPassword = async (
    requestResetTokenDto: RequestResetTokenDto,
  ): Promise<ResponseResetTokenDto> => {
    const response = await http.post(
      "/auth/forgot-password",
      requestResetTokenDto,
    );
    return response.data;
  };

  return {
    signIn,
    signUp,
    oauth,
    resetPassword,
    forgetPassword,
  };
}

export type AuthResource = ReturnType<typeof createAuthResource>;
