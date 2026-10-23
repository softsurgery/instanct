import { Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ResponseAbstractUserDto } from "../dtos/abstract-user/response-abstract-user.dto";
import {
  USER_REPOSITORY,
  USER_SERVICE,
  AppUserRepository,
  AppUserService,
} from "../tokens/user-access";
import {
  createBindingSlot,
  resolveBoundProvider,
} from "@softsurgery/nsa-helpers";

export type UserEntityClass = any;
export type UserDtoClass = Type<ResponseAbstractUserDto>;
export type UserServiceClass = Type<AppUserService> | any;
export type UserRepositoryClass = Type<AppUserRepository> | any;

export const USER_ENTITY = Symbol.for("USER_ENTITY");
export const USER_DTO = Symbol.for("USER_DTO");
export { USER_SERVICE, USER_REPOSITORY };

export function resolveBoundUserService(
  moduleRef: ModuleRef,
): AppUserService | null {
  return resolveBoundProvider(moduleRef, getUserService);
}

export function resolveBoundUserRepository(
  moduleRef: ModuleRef,
): AppUserRepository | null {
  return resolveBoundProvider(moduleRef, getUserRepository);
}

const userEntity = createBindingSlot<UserEntityClass>("AbstractUserEntity");
const userDto = createBindingSlot<UserDtoClass>(ResponseAbstractUserDto);
const userService = createBindingSlot<UserServiceClass>(null);
const userRepository = createBindingSlot<UserRepositoryClass>(null);

export const userBindingRegistry = {
  getUserEntity: userEntity.get,
  setUserEntity: userEntity.set,
  getUserDto: userDto.get,
  setUserDto: userDto.set,
  getUserService: userService.get,
  setUserService: userService.set,
  getUserRepository: userRepository.get,
  setUserRepository: userRepository.set,
};

export const bindUserEntity = userEntity.set;
export const getUserEntity = userEntity.get;

export const bindUserDto = userDto.set;
export const getUserDto = userDto.get;

export const bindUserService = userService.set;
export const getUserService = userService.get;

export const bindUserRepository = userRepository.set;
export const getUserRepository = userRepository.get;
