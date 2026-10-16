import { Type } from '@nestjs/common';
import { ResponseAbstractUserDto } from '../dtos/abstract-user/response-abstract-user.dto';

export type UserEntityClass = any;
export type UserDtoClass = Type<ResponseAbstractUserDto>;

export const USER_ENTITY = Symbol('USER_ENTITY');
export const USER_DTO = Symbol('USER_DTO');

let userEntityClass: UserEntityClass = 'AbstractUserEntity';
let userDtoClass: UserDtoClass = ResponseAbstractUserDto;

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
