import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageRepository } from './repositories/storage.repository';
import { StorageEntity } from './entities/storage.entity';
import { storageProvider } from './providers/storage.provider';
import { ConfigModule } from '@nestjs/config';
import {
  STORAGE_SYSTEMATICS_TOKEN,
  storageSystematicsRegistry,
} from './constants/storage-systematics.registry';

@Module({
  controllers: [],
  providers: [
    storageProvider,
    StorageRepository,
    {
      provide: STORAGE_SYSTEMATICS_TOKEN,
      useValue: storageSystematicsRegistry,
    },
  ],
  exports: [storageProvider, STORAGE_SYSTEMATICS_TOKEN],
  imports: [TypeOrmModule.forFeature([StorageEntity]), ConfigModule],
})
export class StorageModule {}
