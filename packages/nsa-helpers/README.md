# @softsurgery/nsa-helpers

Shared utilities for the Instanct backend packages, including runtime dependency-injection binding slots, lazy module reference proxies, hashing, HTTP request utilities, and URL helpers.

---

## Exports

### Runtime Binding Utilities

Used across `@softsurgery/nsa-*` packages to decouple generic modules from application-level implementations without circular dependency issues.

- **`createBindingSlot<T>(initial: T)`**
  Creates an encapsulated getter/setter pair for module-level mutable registry state.

  ```typescript
  import { createBindingSlot } from "@softsurgery/nsa-helpers";

  const mySlot = createBindingSlot<MyType | null>(null);
  export const setMyValue = mySlot.set;
  export const getMyValue = mySlot.get;
  ```

- **`createLazyModuleRefProxy<T>(resolve: () => T | null | undefined): T`**
  Returns an ES6 Proxy that lazily resolves an instance on first property access, caches it, and rebinds methods to the real instance so that `this` context is preserved (preventing the NestJS circular proxy trap). Ignores `prop === 'then'` to prevent unintended Promise resolution.

- **`resolveBoundProvider<T>(moduleRef: ModuleRef, getProviderClass: () => Type<T> | null | undefined): T | null`**
  Combines `createLazyModuleRefProxy` with Nest's `moduleRef.get(providerClass, { strict: false })` wrapped in error handling.

> For a full architectural guide on how dynamic runtime bindings work across Nest modules, see [Runtime Bindings Documentation](../../apps/api/docs/runtime-bindings.md).

### Cryptographic Helpers

- **`hashPassword(password: string): Promise<string>`**
  Hashes passwords using bcrypt with a salt factor of 10.
- **`comparePassword(password: string, hash: string): Promise<boolean>`**
  Compares plain passwords with bcrypt hashes.

### HTTP and URL Helpers

- **`getClientIp(req: Request): string`**
  Extracts the real client IP address from proxy headers (`x-forwarded-for`, `x-real-ip`) or socket connections.
- **`normalizeUrl(url: string): string`**
  Normalizes URL strings, trims trailing slashes, and resolves query params.
