import {
  ResponseConfigurationNamespaceDto,
  UpdateConfigurationParameterDto,
} from "@/types";

export const CONFIGURATION_EXPORT_VERSION = 1;

export type ConfigurationExportFile = {
  version: number;
  exportedAt: string;
  namespaces: Record<string, Record<string, string>>;
};

type ImportNamespacesArray = {
  name: string;
  params?: { name: string; value?: string }[];
}[];

function valueById(updateDtos: UpdateConfigurationParameterDto[], id: number) {
  return updateDtos.find((dto) => dto.id === id)?.value ?? "";
}

export function buildConfigurationExport(
  configurations: ResponseConfigurationNamespaceDto[],
  updateDtos: UpdateConfigurationParameterDto[],
): ConfigurationExportFile {
  const namespaces: Record<string, Record<string, string>> = {};

  for (const namespace of configurations) {
    if (!namespace.name) continue;
    const params: Record<string, string> = {};
    for (const param of namespace.params ?? []) {
      if (!param.name) continue;
      params[param.name] = valueById(updateDtos, param.id);
    }
    namespaces[namespace.name] = params;
  }

  return {
    version: CONFIGURATION_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    namespaces,
  };
}

function normalizeImportNamespaces(payload: unknown): Record<string, Record<string, string>> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid configuration file");
  }

  const root = payload as Record<string, unknown>;
  const namespaces = root.namespaces;

  if (Array.isArray(namespaces)) {
    const normalized: Record<string, Record<string, string>> = {};
    for (const entry of namespaces as ImportNamespacesArray) {
      if (!entry?.name) continue;
      normalized[entry.name] = {};
      for (const param of entry.params ?? []) {
        if (!param?.name) continue;
        normalized[entry.name][param.name] = param.value ?? "";
      }
    }
    return normalized;
  }

  if (namespaces && typeof namespaces === "object" && !Array.isArray(namespaces)) {
    const normalized: Record<string, Record<string, string>> = {};
    for (const [namespaceName, params] of Object.entries(namespaces)) {
      if (!params || typeof params !== "object" || Array.isArray(params)) continue;
      normalized[namespaceName] = {};
      for (const [paramName, value] of Object.entries(params)) {
        normalized[namespaceName][paramName] =
          value == null ? "" : String(value);
      }
    }
    return normalized;
  }

  throw new Error("Invalid configuration file");
}

export function parseConfigurationImportFile(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file");
  }
  return normalizeImportNamespaces(parsed);
}

export function applyConfigurationImport(
  configurations: ResponseConfigurationNamespaceDto[],
  importedNamespaces: Record<string, Record<string, string>>,
  updateDtos: UpdateConfigurationParameterDto[],
) {
  const byId = new Map(updateDtos.map((dto) => [dto.id, { ...dto }]));
  let applied = 0;
  let skipped = 0;

  for (const namespace of configurations) {
    if (!namespace.name) continue;
    const importedParams = importedNamespaces[namespace.name];
    if (!importedParams) continue;

    for (const param of namespace.params ?? []) {
      if (!param.name || !(param.name in importedParams)) continue;
      const next = byId.get(param.id);
      if (!next) {
        skipped += 1;
        continue;
      }
      next.value = importedParams[param.name] ?? "";
      byId.set(param.id, next);
      applied += 1;
    }
  }

  for (const namespaceName of Object.keys(importedNamespaces)) {
    const known = configurations.some((namespace) => namespace.name === namespaceName);
    if (!known) {
      skipped += Object.keys(importedNamespaces[namespaceName]).length;
    }
  }

  return {
    updateDtos: [...byId.values()],
    applied,
    skipped,
  };
}

export function downloadConfigurationExport(payload: ConfigurationExportFile) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = payload.exportedAt.slice(0, 10);
  anchor.href = url;
  anchor.download = `instanct-configuration-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
