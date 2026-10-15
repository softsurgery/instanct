import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { StorageService } from '@softsurgery/nsa-storage/services/storage.service';

@Injectable()
export class AppService {
  private version: string | undefined;

  constructor(private readonly storageService: StorageService) {}
  getHealth() {
    return {
      message: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getStorageType() {
    return this.storageService.getStorageType();
  }

  getVersion() {
    return {
      version: this.readVersion(),
    };
  }

  private readVersion() {
    if (this.version) return this.version;

    const candidates = [
      join(__dirname, '../../package.json'),
      join(process.cwd(), 'package.json'),
    ];

    for (const file of candidates) {
      try {
        const parsed = JSON.parse(readFileSync(file, 'utf8')) as {
          name?: string;
          version?: string;
        };
        if (parsed.name === 'instanct-api' && parsed.version) {
          this.version = parsed.version;
          return this.version;
        }
      } catch {
        continue;
      }
    }

    this.version = 'unknown';
    return this.version;
  }
}
