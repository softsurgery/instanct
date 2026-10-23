import { createLazyModuleRefProxy } from './lazy-module-ref-proxy.utils';

type ProviderClass<T> = abstract new (...args: never[]) => T;

type ModuleRefLike = {
  get<TInput = unknown, TResult = TInput>(
    typeOrToken: ProviderClass<TResult> | string | symbol,
    options?: { strict?: boolean },
  ): TResult;
};

export function resolveBoundProvider<T extends object>(
  moduleRef: ModuleRefLike,
  getProviderClass: () => ProviderClass<T> | null | undefined,
): T | null {
  return createLazyModuleRefProxy<T>(() => {
    const providerClass = getProviderClass();
    if (!providerClass) {
      return null;
    }
    try {
      return moduleRef.get(providerClass, { strict: false });
    } catch {
      return null;
    }
  });
}
