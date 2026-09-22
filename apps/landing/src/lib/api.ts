import { createApiClient } from "@instanct/api-client";

const baseURL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

export const api = createApiClient({
  baseURL,
});

export default api;
