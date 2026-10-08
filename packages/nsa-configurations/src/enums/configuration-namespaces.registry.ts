export type ConfigurationNamespaces = string;

export const CONFIGURATION_NAMESPACES = Symbol('CONFIGURATION_NAMESPACES');

export const ConfigurationNamespaces: Record<string, ConfigurationNamespaces> =
  {};

export const configurationNamespacesRegistry = ConfigurationNamespaces;

export function bindConfigurationNamespaces(source: Record<string, string>) {
  Object.assign(ConfigurationNamespaces, source);
}
