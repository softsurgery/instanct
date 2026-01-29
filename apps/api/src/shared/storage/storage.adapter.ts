import { Readable } from 'stream';

export interface StorageAdapter {
  upload(path: string, buffer: Buffer, mimetype: string): Promise<void>;
  read(path: string): Promise<Readable>;
  delete(path: string): Promise<void>;
  copy(source: string, destination: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
