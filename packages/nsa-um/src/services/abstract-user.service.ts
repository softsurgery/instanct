import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { UserNotFoundException } from '../errors/user/user.notfound.error';
import { IQueryObject } from 'nsa-database';
import { QueryBuilder } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { PageMetaDto } from 'nsa-database';
import { hashPassword } from 'nsa-helpers/hash.utils';
import { AbstractUserEntity } from '../entities/abstract-user.entity';
import { DatabaseAbstractRepository } from 'nsa-database';

@Injectable()
export abstract class AbstractUserService {
  private abstractUserRepository: DatabaseAbstractRepository<AbstractUserEntity>;
  constructor(
    abstractUserRepository: DatabaseAbstractRepository<AbstractUserEntity>,
  ) {
    this.abstractUserRepository = abstractUserRepository;
  }

  async findOneById(
    id: string,
    query?: Pick<IQueryObject, 'join'>,
  ): Promise<AbstractUserEntity | null> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = query ? queryBuilder.build(query) : {};
    const user = await this.abstractUserRepository.findOne({
      where: { id },
      relations: queryOptions.relations,
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }
  async findOneByCondition(
    query: IQueryObject,
  ): Promise<AbstractUserEntity | null | undefined> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const user = await this.abstractUserRepository.findOne(
      queryOptions as FindOneOptions<AbstractUserEntity>,
    );
    return user;
  }

  async findAll(query: IQueryObject): Promise<AbstractUserEntity[]> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const users = await this.abstractUserRepository.findAll(
      queryOptions as FindManyOptions<AbstractUserEntity>,
    );
    return users || [];
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<AbstractUserEntity>> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const count = await this.abstractUserRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.abstractUserRepository.findAll(
      queryOptions as FindManyOptions<AbstractUserEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count || 0,
    });

    return new PageDto(entities || [], pageMetaDto);
  }

  async save(
    createUserDto: Partial<AbstractUserEntity>,
  ): Promise<AbstractUserEntity | undefined> {
    const hashedPassword =
      createUserDto.password && (await hashPassword(createUserDto.password));
    createUserDto.password = hashedPassword;
    return this.abstractUserRepository.save(createUserDto);
  }

  @Transactional()
  async update(
    id: string,
    updateUserDto: Partial<AbstractUserEntity>,
  ): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository?.update(id, updateUserDto);
  }

  async softDelete(id: string): Promise<AbstractUserEntity | null | undefined> {
    return await this.abstractUserRepository?.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.abstractUserRepository.restore(id);
  }

  //Extended Methods ===========================================================================

  async findOneByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
  }

  async findOneByEmail(
    email: string,
    withDeleted = false,
    query?: Pick<IQueryObject, 'join'>,
  ): Promise<AbstractUserEntity | null | undefined> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = query ? queryBuilder.build(query) : {};
    return this.abstractUserRepository.findOne({
      where: { email },
      relations: queryOptions.relations,
      withDeleted,
    });
  }

  async findOneByUsername(
    username: string,
    withDeleted: boolean = false,
    query?: Pick<IQueryObject, 'join'>,
  ): Promise<AbstractUserEntity | null | undefined> {
    const queryBuilder = new QueryBuilder(
      this.abstractUserRepository.getMetadata(),
    );
    const queryOptions = query ? queryBuilder.build(query) : {};
    return this.abstractUserRepository.findOne({
      where: { username },
      relations: queryOptions.relations,
      withDeleted,
    });
  }

  async activate(id: string): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository.update(id, {
      isActive: false,
    });
  }

  async approve(id: string): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository.update(id, {
      isApproved: true,
    });
  }

  async disapprove(id: string): Promise<AbstractUserEntity | null | undefined> {
    return this.abstractUserRepository.update(id, {
      isApproved: false,
    });
  }

  async changePassword(
    id: string,
    password: string,
  ): Promise<AbstractUserEntity | null | undefined> {
    const user = await this.findOneById(id);
    const hashedPassword = await hashPassword(password);
    return this.abstractUserRepository.update(id, {
      ...user,
      password: hashedPassword,
    });
  }
}
