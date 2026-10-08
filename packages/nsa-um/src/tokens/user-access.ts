import { FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractUserEntity } from '../entities/abstract-user.entity';

export const USER_SERVICE = Symbol('USER_SERVICE');
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type AppUserRecord = AbstractUserEntity & {
  pictureId?: number;
};

export interface AppUserService {
  findOneById(id: string): Promise<AppUserRecord | null | undefined>;
  save(data: Partial<AppUserRecord>): Promise<AppUserRecord | undefined>;
  findOneByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<AppUserRecord | null | undefined>;
  findOneByEmail(
    email: string,
    withDeleted?: boolean,
  ): Promise<AppUserRecord | null | undefined>;
  findOneByUsername(
    username: string,
    withDeleted?: boolean,
  ): Promise<AppUserRecord | null | undefined>;
  extendedSave(
    data: Partial<AppUserRecord> & Record<string, unknown>,
  ): Promise<AppUserRecord>;
  restore(id: string): Promise<void>;
  updatePassword(id: string, password: string): Promise<AppUserRecord | null>;
}

export interface AppUserRepository {
  findOne(
    options: FindOneOptions<AppUserRecord>,
  ): Promise<AppUserRecord | null>;
  findOneById(id: string | number): Promise<AppUserRecord | null>;
  restore(id: string): Promise<unknown>;
  update(
    id: string | number,
    data: QueryDeepPartialEntity<AppUserRecord>,
  ): Promise<AppUserRecord | null>;
}
