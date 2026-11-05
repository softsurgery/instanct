import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id?: string;
    username?: string;
    access_token: string;
    refresh_token?: string;
    isApproved?: boolean;
  }

  interface Session {
    user: {
      id?: string;
      username?: string;
      access_token?: string;
      refresh_token?: string;
      isApproved?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    access_token?: string;
    refresh_token?: string;
    isApproved?: boolean;
  }
}
