import { initPersistStores, noopPersistStorage } from "@softsurgery/hooks/stores";

void initPersistStores(
  typeof window !== "undefined" && typeof localStorage !== "undefined"
    ? localStorage
    : noopPersistStorage,
);
