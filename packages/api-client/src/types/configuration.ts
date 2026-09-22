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
