import { Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { createLazyModuleRefProxy } from './lazy-module-ref-proxy.utils';

export function resolveBoundProvider<T extends object>(
  moduleRef: ModuleRef,
  getProviderClass: () => Type<T> | null | undefined,
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
