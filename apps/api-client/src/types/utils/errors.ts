import type { AxiosError } from "axios";

export interface ServerResponse<T = undefined> {
  message: string;
  code: number;
  data: T;
}

export interface ServerError {
  message: string;
  code: number;
}

export type ServerErrorResponse = AxiosError<ServerError>;

export interface ServerErrorBody {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };
    status?: number;
  };
}
