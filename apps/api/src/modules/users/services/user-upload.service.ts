import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { UserUploadEntity } from '../entities/user-upload.entity';
import { CreateUserUploadDto } from '../dtos/user-upload/create-user-upload.dto';
import { StorageService } from 'src/shared/storage/services/storage.service';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { UserUploadRepository } from '../repositories/user-upload.repository';

@Injectable()
export class UserUploadService extends AbstractCrudService<UserUploadEntity> {
  constructor(
    private readonly userUploadRepository: UserUploadRepository,
    private readonly storageService: StorageService,
  ) {
    super(userUploadRepository);
  }

  @Transactional()
  async save(createProfileUploadDto: CreateUserUploadDto) {
    if (createProfileUploadDto.uploadId)
      await this.storageService.confirm(createProfileUploadDto.uploadId);
    return this.userUploadRepository.save(createProfileUploadDto);
  }

  @Transactional()
  async saveMany(createProfileUploadDto: CreateUserUploadDto[]) {
    await Promise.all(
      createProfileUploadDto.map(async (dto) => {
        if (dto.uploadId) await this.storageService.confirm(dto.uploadId);
      }),
    );
    return this.userUploadRepository.saveMany(createProfileUploadDto);
  }
}
