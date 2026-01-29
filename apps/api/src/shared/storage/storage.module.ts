import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './services/storage.service';
import { StorageRepository } from './repositories/storage.repository';
import { StorageEntity } from './entities/storage.entity';

@Module({
  controllers: [],
  providers: [StorageService, StorageRepository],
  exports: [StorageService],
  imports: [TypeOrmModule.forFeature([StorageEntity])],
})
export class StorageModule {}
