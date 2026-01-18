import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { UserRepository } from '../repositories/user.repository';
import { UploadService } from 'src/shared/uploads/services/upload.service';
import { UserUploadService } from './user-upload.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UserNotFoundException } from 'src/shared/abstract-user-management/errors/user/user.notfound.error';
import { UserUploadEntity } from '../entities/user-upload.entity';
import { CreateUserUploadDto } from '../dtos/user-upload/create-user-upload.dto';
import { UpdateUserUploadDto } from '../dtos/user-upload/update-user-upload.dto';
import { AbstractUserService } from 'src/shared/abstract-user-management/services/abstract-user.service';

@Injectable()
export class UserService extends AbstractUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userUploadService: UserUploadService,
    private readonly uploadService: UploadService,
  ) {
    super(userRepository);
  }

  async findOneById(id: string): Promise<UserEntity> {
    const profile = await this.userRepository.findOneById(id);
    if (!profile) {
      throw new UserNotFoundException();
    }
    return profile;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<UserEntity | null> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const profile = await this.userRepository.findOne(
      queryOptions as FindOneOptions<UserEntity>,
    );
    return profile;
  }

  async findAll(query: IQueryObject): Promise<UserEntity[]> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const profiles = await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );
    return profiles;
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<UserEntity>> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const count = await this.userRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  @Transactional()
  async save(createProfileDto: CreateUserDto): Promise<UserEntity> {
    return await this.userRepository.save(createProfileDto);
  }

  @Transactional()
  async saveMany(createProfileDto: CreateUserDto[]): Promise<UserEntity[]> {
    return Promise.all(createProfileDto.map((dto) => this.save(dto)));
  }

  @Transactional()
  async update(
    id: string,
    updateProfileDto: UpdateUserDto,
  ): Promise<UserEntity | null> {
    return this.userRepository.update(id, updateProfileDto);
  }

  async softDelete(id: string): Promise<UserEntity | null> {
    return this.userRepository.softDelete(id);
  }

  async delete(id: number): Promise<UserEntity | null> {
    const profile = await this.userRepository.findOneById(id);
    if (!profile) {
      throw new UserNotFoundException();
    }
    return this.userRepository.remove(profile);
  }

  //Extended Methods ===========================================================================

  @Transactional()
  async extendedSave(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { uploads, ...rest } = createUserDto;
    if (createUserDto.pictureId)
      await this.uploadService.confirm(createUserDto.pictureId);
    if (createUserDto.officialDocumentId)
      await this.uploadService.confirm(createUserDto.officialDocumentId);
    if (createUserDto.driverLicenseDocumentId)
      await this.uploadService.confirm(createUserDto.driverLicenseDocumentId);
    const user = await this.userRepository.save(rest);

    await this.userUploadService.saveMany(
      uploads?.map((upload, index) => ({
        userId: user.id,
        uploadId: upload.uploadId,
        order: index,
      })) || [],
    );

    return user;
  }

  @Transactional()
  async extendedUpdate(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const { uploads, ...rest } = updateUserDto;
    const existingProfile = await this.findOneById(id);
    if (!existingProfile) throw new UserNotFoundException();

    await this.userRepository.update(id, rest);
    //confirm new profile picture
    if (
      updateUserDto.pictureId &&
      updateUserDto.pictureId != existingProfile.pictureId
    ) {
      await this.uploadService.confirm(updateUserDto.pictureId);
      if (existingProfile.pictureId)
        await this.uploadService.delete(existingProfile.pictureId);
    }

    //confirm new official document
    if (
      updateUserDto.officialDocumentId &&
      updateUserDto.officialDocumentId != existingProfile.officialDocumentId
    ) {
      await this.uploadService.confirm(updateUserDto.officialDocumentId);
    }

    //confirm new driver license document
    if (
      updateUserDto.driverLicenseDocumentId &&
      updateUserDto.driverLicenseDocumentId !=
        existingProfile.driverLicenseDocumentId
    ) {
      await this.uploadService.confirm(updateUserDto.driverLicenseDocumentId);
    }

    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['uploads'],
    });

    if (!updatedUser) throw new UserNotFoundException();

    const existingUploads = updatedUser?.uploads?.map((j: UserUploadEntity) => {
      return {
        id: j.id,
        userId: j.userId,
        uploadId: j.uploadId,
        order: j.order,
      };
    });

    await this.userRepository.updateJunctionAssociations<
      Pick<UserUploadEntity, 'id' | 'userId' | 'uploadId' | 'order'>
    >({
      existingItems: existingUploads || [],
      updatedItems:
        uploads?.map((upload, index) => ({
          id: upload.id,
          userId: id,
          uploadId: upload.uploadId,
          order: index,
        })) || [],
      keys: ['userId', 'uploadId'],
      onDelete: async (id: number) => this.userUploadService.softDelete(id),
      onCreate: async (j: CreateUserUploadDto) =>
        this.userUploadService.save({
          userId: id,
          uploadId: j.uploadId,
          order: j.order,
        }),
      onUpdate: async (id: number, item: UpdateUserUploadDto) =>
        this.userUploadService.update(id, item),
    });

    return updatedUser;
  }
}
