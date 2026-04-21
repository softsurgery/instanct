import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { UserRepository } from '../repositories/user.repository';
import { UserUploadService } from './user-upload.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UserNotFoundException } from 'src/shared/abstract-user-management/errors/user/user.notfound.error';
import { UserUploadEntity } from '../entities/user-upload.entity';
import { CreateUserUploadDto } from '../dtos/user-upload/create-user-upload.dto';
import { UpdateUserUploadDto } from '../dtos/user-upload/update-user-upload.dto';
import { AbstractUserService } from 'src/shared/abstract-user-management/services/abstract-user.service';
import { hashPassword } from 'src/shared/helpers/hash.utils';
import { RefParamRepository } from 'src/shared/reference-types/repositories/ref-param.repository';
import { RefParamEntity } from 'src/shared/reference-types/entities/ref-param.entity';
import { StorageService } from 'src/shared/storage/services/storage.service';
import { UserConfigurationService } from './user-configuration.service';

@Injectable()
export class UserService extends AbstractUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userUploadService: UserUploadService,
    private readonly userConfigurationService: UserConfigurationService,
    private readonly storageService: StorageService,
    private readonly refParamRepository: RefParamRepository,
  ) {
    super(userRepository);
  }

  async findRelationalOneById(
    id: string,
    query?: Pick<IQueryObject, 'join'>,
  ): Promise<UserEntity | null> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = query ? queryBuilder.build(query) : {};
    const user = await this.userRepository.findOne({
      where: { id },
      relations: queryOptions.relations,
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<UserEntity | null> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const user = await this.userRepository.findOne(
      queryOptions as FindOneOptions<UserEntity>,
    );
    return user;
  }

  async findAll(query: IQueryObject): Promise<UserEntity[]> {
    const queryBuilder = new QueryBuilder(this.userRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const users = await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );
    return users;
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
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return this.userRepository.remove(user);
  }

  //Extended Methods ===========================================================================

  @Transactional()
  async extendedSave(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { uploads, ...rest } = createUserDto;
    if (createUserDto.pictureId)
      await this.storageService.confirm(createUserDto.pictureId);

    if (!rest.password) throw new BadRequestException('Password is required');

    const user = await this.userRepository.save({
      ...rest,
      password: await hashPassword(rest.password),
    });

    await this.userConfigurationService.createPersonalMapConfiguration(user.id);

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
    const existingUser = await this.findRelationalOneById(id);
    if (!existingUser) throw new UserNotFoundException();

    await this.userRepository.update(id, rest);
    //confirm new picture
    if (
      updateUserDto.pictureId &&
      updateUserDto.pictureId != existingUser.pictureId
    ) {
      await this.storageService.confirm(updateUserDto.pictureId);
      if (existingUser.pictureId)
        await this.storageService.delete(existingUser.pictureId);
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

  async getIndustries(id: string): Promise<number[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['industries'],
    });

    if (!user) throw new UserNotFoundException();

    return user.industries.map((industry) => industry.id);
  }

  async updateIndustries(
    id: string,
    industryIds: number[],
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['industries'],
    });

    if (!user) throw new UserNotFoundException();

    let industries: RefParamEntity[] = [];

    if (industryIds && industryIds.length > 0) {
      const result = await this.refParamRepository.findAll({
        where: { id: In(industryIds) },
      });

      if (result) {
        if (Array.isArray(result)) {
          industries = result;
        } else {
          industries = [result];
        }
      }
    }

    user.industries = industries;
    return await this.userRepository.save(user);
  }

  async updateCover(id: string, coverId: number): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UserNotFoundException();

    if (coverId && coverId != user.coverId) {
      await this.storageService.confirm(coverId);
      if (user.coverId) await this.storageService.delete(user.coverId);
    }

    return this.userRepository.update(id, { coverId });
  }
}
