import type { ResponseUserDto } from "./user-management";

export enum ParamVariant {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  LIST = "list",
}

export interface ConfigurationListFieldSchema {
  key: string;
  label: string;
  variant: ParamVariant;
  required?: boolean;
}

export interface ResponseConfigurationParamDto {
  id: number;
  name?: string;
  description?: string;
  namespace: ResponseConfigurationNamespaceDto;
  namespaceId: string;
  variant: ParamVariant;
  value?: string;
  options?: { label: string; value: string }[];
  schema?: ConfigurationListFieldSchema[];
  min?: number;
  max?: number;
}

export interface ResponseConfigurationNamespaceDto {
  id: string;
  name?: string;
  description?: string;
  params?: ResponseConfigurationParamDto[];
  userId?: string;
  user: ResponseUserDto;
}

export interface UpdateConfigurationParameterDto {
  id: number;
  value: string;
}

export enum ConfigurationNamespaces {
  MAPS = "maps",
  PERSONAL_MAP = "personalMap",
  CORE = "core",
  APPLICATION = "application",
}

export enum ApplicationConfigurationParam {
  LANGUAGES = "languages",
  APP_METADATA_NAME = "appMetaData.name",
  APP_METADATA_DESCRIPTION = "appMetaData.description",
  VERSION_IOS_MIN_VERSION = "version.ios.minVersion",
  VERSION_ANDROID_MIN_VERSION = "version.android.minVersion",
  VERSION_IOS_STORE_URL = "version.ios.storeUrl",
  VERSION_ANDROID_STORE_URL = "version.android.storeUrl",
}

export interface PlatformVersionPolicyDto {
  minVersion: string;
  storeUrl: string;
}

export interface AppVersionPolicyDto {
  ios: PlatformVersionPolicyDto;
  android: PlatformVersionPolicyDto;
}

