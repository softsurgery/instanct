export interface Store {
  id: string;
  description: string;
  value: object;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateStoreDto extends Store {}
