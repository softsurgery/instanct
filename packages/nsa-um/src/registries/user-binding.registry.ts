import { Type } from '@nestjs/common';
import { ResponseAbstractUserDto } from '../dtos/abstract-user/response-abstract-user.dto';
import {
  USER_REPOSITORY,
  USER_SERVICE,
  AppUserRepository,
  AppUserService,
} from '../tokens/user-access';

export type UserEntityClass = any;
export type UserDtoClass = Type<ResponseAbstractUserDto>;
export type UserServiceClass = Type<AppUserService> | any;
export type UserRepositoryClass = Type<AppUserRepository> | any;

export const USER_ENTITY = Symbol.for('USER_ENTITY');
export const USER_DTO = Symbol.for('USER_DTO');
export { USER_SERVICE, USER_REPOSITORY };

let userEntityClass: UserEntityClass = 'AbstractUserEntity';
let userDtoClass: UserDtoClass = ResponseAbstractUserDto;
let userServiceClass: UserServiceClass = null;
let userRepositoryClass: UserRepositoryClass = null;

export const userBindingRegistry = {
  getUserEntity(): UserEntityClass {
    return userEntityClass;
  },
  setUserEntity(entity: UserEntityClass) {
    userEntityClass = entity;
  },
  getUserDto(): UserDtoClass {
    return userDtoClass;
  },
  setUserDto(dto: UserDtoClass) {
    userDtoClass = dto;
  },
  getUserService(): UserServiceClass {
    return userServiceClass;
  },
  setUserService(service: UserServiceClass) {
    userServiceClass = service;
  },
  getUserRepository(): UserRepositoryClass {
    return userRepositoryClass;
  },
  setUserRepository(repository: UserRepositoryClass) {
    userRepositoryClass = repository;
  },
};

export function bindUserEntity(entity: UserEntityClass) {
  userBindingRegistry.setUserEntity(entity);
}

export function getUserEntity(): UserEntityClass {
  return userBindingRegistry.getUserEntity();
}

export function bindUserDto(dto: UserDtoClass) {
  userBindingRegistry.setUserDto(dto);
}

export function getUserDto(): UserDtoClass {
  return userBindingRegistry.getUserDto();
}

export function bindUserService(service: UserServiceClass) {
  userBindingRegistry.setUserService(service);
}

export function getUserService(): UserServiceClass {
  return userBindingRegistry.getUserService();
}

export function bindUserRepository(repository: UserRepositoryClass) {
  userBindingRegistry.setUserRepository(repository);
}

export function getUserRepository(): UserRepositoryClass {
  return userBindingRegistry.getUserRepository();
}
