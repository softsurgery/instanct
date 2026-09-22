import { ParamVariant } from '../enums/param-variant.enum';

export interface ConfigurationListFieldSchema {
  key: string;
  label: string;
  variant: ParamVariant;
  required?: boolean;
}

export function coerceConfigurationListFieldValue(
  value: unknown,
): string | null {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function isPlainConfigurationListItem(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isValidConfigurationListItem(
  item: unknown,
  schema: ConfigurationListFieldSchema[],
): boolean {
  if (!isPlainConfigurationListItem(item)) return false;

  for (const field of schema) {
    if (coerceConfigurationListFieldValue(item[field.key]) === null) {
      return false;
    }
  }

  const hasAnyValue = schema.some(
    (field) =>
      (coerceConfigurationListFieldValue(item[field.key]) ?? '').trim().length >
      0,
  );

  if (!hasAnyValue) return true;

  return schema.every((field) => {
    if (!field.required) return true;
    const text = coerceConfigurationListFieldValue(item[field.key]) ?? '';
    return text.trim().length > 0;
  });
}

export function isValidConfigurationListValue(
  value: string | null | undefined,
  schema: ConfigurationListFieldSchema[] = [],
): boolean {
  if (!value?.trim()) return true;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return false;
    return parsed.every((item) => isValidConfigurationListItem(item, schema));
  } catch {
    return false;
  }
}

export function parseConfigurationListValue(
  value?: string | null,
): Record<string, string>[] {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Record<string, string> =>
        Boolean(item) && typeof item === 'object' && !Array.isArray(item),
    );
  } catch {
    return [];
  }
}
