export interface ResponseConfigurationParamDto {
  id: string;
  name?: string;
  description?: string;
  namespace: ResponseConfigurationNamespaceDto;
  namespaceId: string;
  variant: ParamVariant;
  value?: string;
  options?: { label: string; value: string }[];
}

export interface ResponseConfigurationNamespaceDto {
  id: string;
  description?: string;
  params?: ResponseConfigurationParamDto[];
}

export enum ParamVariant {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
}
