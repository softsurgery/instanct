import type { MobileApi } from "@/lib/api";

let backgroundApi: MobileApi | null = null;

export function bindBackgroundApi(client: MobileApi) {
  backgroundApi = client;
}

export function getBackgroundApi(): MobileApi | null {
  return backgroundApi;
}
