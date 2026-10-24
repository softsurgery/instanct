/**
 * Resolves a value lazily and binds methods to the real instance.
 * Needed when modules import each other via forwardRef — ModuleRef.get()
 * during factory init returns a Nest circular proxy that loses instance
 * fields when methods run with `this` set to the proxy.
 */
export function createLazyModuleRefProxy<T extends object>(
  resolve: () => T | null | undefined,
): T {
  let cached: T | null | undefined;
  const getInstance = () => {
    if (cached === undefined) {
      cached = resolve() ?? null;
    }
    return cached;
  };

  return new Proxy({} as T, {
    get(_target, prop, _receiver) {
      if (prop === "then") {
        return undefined;
      }
      const instance = getInstance() as Record<PropertyKey, unknown> | null;
      if (instance == null) {
        return undefined;
      }
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}
