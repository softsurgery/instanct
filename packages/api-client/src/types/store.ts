export interface Store {
  id: string;
  description: string;
  value: object;
}

export type UpdateStoreDto = Store;
