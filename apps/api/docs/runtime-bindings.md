# Runtime Bindings and Lazy Module Resolution

The runtime binding system decouples shared NestJS packages (`@softsurgery/nsa-*`) from concrete application-level implementations (`apps/api`). It allows abstract libraries (such as authentication, chat, storage, and user management) to interact with application entities, DTOs, services, and repositories without static circular imports or dependency-injection initialization race conditions.

---

## The Problem

### 1. Abstract Packages vs. Concrete Applications

The monorepo architecture divides functionality between reusable packages (`packages/nsa-*`) and the product application (`apps/api`):

- `@softsurgery/nsa-auth` needs access to user verification logic and user persistence (`USER_SERVICE` and `USER_REPOSITORY`).
- `@softsurgery/nsa-um` provides user persistence abstractions (`AbstractUserEntity`, `AbstractUserService`, `ResponseAbstractUserDto`).
- The concrete domain classes—`UserEntity`, `UserService`, `UserRepository`, and `ResponseUserDto`—reside in `apps/api/src/modules/users`.

Packages in `packages/` cannot statically import from `apps/api`. Without a dynamic registration mechanism, shared packages would either need hardcoded dependencies or bulky manual wiring in every consuming module.

### 2. NestJS Circular Proxy Trap (`ModuleRef.get`)

When modules reference each other dynamically or via `forwardRef()`, resolving providers during module factory initialization (`useFactory`) introduces critical failure modes:

1. **Premature Resolution**: Resolving `moduleRef.get(token)` eagerly during factory execution can run before the target provider is instantiated or registered in the DI container.
2. **Lost `this` Context**: NestJS wraps circular dependencies in an internal Proxy. When a method on this proxy is executed with `this` bound to the proxy wrapper rather than the concrete class instance, access to instance fields, private variables, and constructor injections is lost, resulting in runtime `undefined` errors.
3. **Thenable Traps**: If an object or proxy implements or passes through a `then` property, runtime tools or Promise resolution routines may misinterpret the proxy as a Promise.

---

## Architecture

```text
apps/api/src/main.ts (or cli.ts)
  │
  ├──► import './bind-app-values'  (Runs synchronously before NestFactory.create)
  │      │
  │      ├─► bindUserService(UserService)
  │      ├─► bindUserRepository(UserRepository)
  │      ├─► bindUserEntity(UserEntity)
  │      └─► bindUserDto(ResponseUserDto)
  │
  ▼
NestJS Bootstrap
  │
  ├──► AuthModule (packages/nsa-auth)
  │      │
  │      ├── provides: USER_SERVICE
  │      │     useFactory: (moduleRef) => resolveBoundUserService(moduleRef)
  │      │
  │      └── provides: USER_REPOSITORY
  │            useFactory: (moduleRef) => resolveBoundUserRepository(moduleRef)
  │
  ▼
Runtime Method Execution (e.g. authService.validateUser)
  │
  └──► Lazy Proxy intercepts property access
         ├── On first call: moduleRef.get(UserService, { strict: false })
         ├── Caches real instance
         └── Binds methods to real instance: method.bind(instance)
```

---

## Core Utilities (`@softsurgery/nsa-helpers`)

The foundation of the binding system lives in `@softsurgery/nsa-helpers`.

### 1. `createBindingSlot<T>(initial: T)`

File: [`packages/nsa-helpers/src/binding-slot.utils.ts`](file:///home/ubuntu/instanct/instanct/packages/nsa-helpers/src/binding-slot.utils.ts)

Encapsulates mutable registry state inside an isolated closure with standardized getter and setter functions:

```typescript
export function createBindingSlot<T>(initial: T) {
  let value = initial;
  return {
    get: (): T => value,
    set: (next: T) => {
      value = next;
    },
  };
}
```

This replaces ad-hoc global `let` variables with structured, reusable slots.

### 2. `createLazyModuleRefProxy<T>(resolve)`

File: [`packages/nsa-helpers/src/lazy-module-ref-proxy.utils.ts`](file:///home/ubuntu/instanct/instanct/packages/nsa-helpers/src/lazy-module-ref-proxy.utils.ts)

Creates a transparent ES6 Proxy that defers dependency resolution until the first property or method is accessed:

```typescript
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
      if (prop === 'then') {
        return undefined; // Prevents Promise inspection traps
      }
      const instance = getInstance() as Record<PropertyKey, unknown> | null;
      if (instance == null) {
        return undefined;
      }
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}
```

Key guarantees:

- **Lazy evaluation**: `resolve()` is only called when a property on the proxy is requested.
- **Instance caching**: After the first resolution, the instance is reused.
- **Context binding**: Method calls are bound directly to `instance`, preserving `this` context and instance fields.
- **Then-safe**: Returning `undefined` for `prop === 'then'` prevents unwanted Promise assimilation.

### 3. `resolveBoundProvider<T>(moduleRef, getProviderClass)`

File: [`packages/nsa-helpers/src/resolve-bound-provider.utils.ts`](file:///home/ubuntu/instanct/instanct/packages/nsa-helpers/src/resolve-bound-provider.utils.ts)

Pairs `createLazyModuleRefProxy` with NestJS's `ModuleRef`:

```typescript
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
```

---

## User Management Registry (`@softsurgery/nsa-um`)

File: [`packages/nsa-um/src/registries/user-binding.registry.ts`](file:///home/ubuntu/instanct/instanct/packages/nsa-um/src/registries/user-binding.registry.ts)

The user management registry defines slots for the user entity, DTO, service, and repository:

```typescript
const userEntity = createBindingSlot<UserEntityClass>('AbstractUserEntity');
const userDto = createBindingSlot<UserDtoClass>(ResponseAbstractUserDto);
const userService = createBindingSlot<UserServiceClass>(null);
const userRepository = createBindingSlot<UserRepositoryClass>(null);

export const bindUserEntity = userEntity.set;
export const getUserEntity = userEntity.get;

export const bindUserDto = userDto.set;
export const getUserDto = userDto.get;

export const bindUserService = userService.set;
export const getUserService = userService.get;

export const bindUserRepository = userRepository.set;
export const getUserRepository = userRepository.get;

export function resolveBoundUserService(
  moduleRef: ModuleRef,
): AppUserService | null {
  return resolveBoundProvider(moduleRef, getUserService);
}

export function resolveBoundUserRepository(
  moduleRef: ModuleRef,
): AppUserRepository | null {
  return resolveBoundProvider(moduleRef, getUserRepository);
}
```

---

## Consuming in Modules (`@softsurgery/nsa-auth`)

File: [`packages/nsa-auth/src/auth.module.ts`](file:///home/ubuntu/instanct/instanct/packages/nsa-auth/src/auth.module.ts)

`AuthModule` requires `USER_SERVICE` and `USER_REPOSITORY` to authenticate users and manage credentials. Using `resolveBoundUserService` and `resolveBoundUserRepository`, the providers are configured cleanly:

```typescript
@Module({
  providers: [
    AuthService,
    AuthProvidersService,
    ClientAuthService,
    {
      provide: USER_SERVICE,
      useFactory: (moduleRef: ModuleRef) => resolveBoundUserService(moduleRef),
      inject: [ModuleRef],
    },
    {
      provide: USER_REPOSITORY,
      useFactory: (moduleRef: ModuleRef) =>
        resolveBoundUserRepository(moduleRef),
      inject: [ModuleRef],
    },
  ],
  exports: [USER_SERVICE, USER_REPOSITORY],
})
export class AuthModule {}
```

Benefits:

- `AuthModule` does not import `UserManagementModule` directly, avoiding circular module imports.
- `USER_SERVICE` and `USER_REPOSITORY` tokens can be injected into `AuthService` or `ClientAuthService` normally:
  ```typescript
  constructor(
    @Inject(USER_SERVICE) private readonly userService: AppUserService,
    @Inject(USER_REPOSITORY) private readonly userRepository: AppUserRepository,
  ) {}
  ```
- Any method called on `this.userService` executes against the actual concrete instance with intact state.

---

## Application Bootstrap Registration (`apps/api`)

File: [`apps/api/src/bind-app-values.ts`](file:///home/ubuntu/instanct/instanct/apps/api/src/bind-app-values.ts)

The API entrypoints (`apps/api/src/main.ts` and `apps/api/src/cli.ts`) import `bind-app-values` as their first line:

```typescript
import './bind-app-values';
```

`bind-app-values.ts` registers all application-specific entities, DTOs, services, repositories, and enums into their respective slots:

```typescript
import {
  bindUserDto,
  bindUserEntity,
  bindUserService,
  bindUserRepository,
} from '@softsurgery/nsa-um/registries/user-binding.registry';
import { bindEventType } from '@softsurgery/nsa-logger/enums/event-type.registry';
import { bindNotificationType } from '@softsurgery/nsa-notifications/enums/notification-type.registry';
import { bindStaticMessage } from '@softsurgery/nsa-chat/enums/static-message.registry';
import { bindSessionType } from '@softsurgery/nsa-sessions/enums/session-type.registry';
import { bindConfigurationNamespaces } from '@softsurgery/nsa-configurations/enums/configuration-namespaces.registry';
import { bindStorageSystematics } from '@softsurgery/nsa-storage/constants/storage-systematics.registry';

import { ResponseUserDto } from './modules/users/dtos/user/response-user.dto';
import { UserEntity } from './modules/users/entities/user.entity';
import { UserService } from './modules/users/services/user.service';
import { UserRepository } from './modules/users/repositories/user.repository';

// User bindings
bindUserEntity(UserEntity);
bindUserDto(ResponseUserDto);
bindUserService(UserService);
bindUserRepository(UserRepository);

// Enum & constant registries
bindEventType(EventType);
bindNotificationType(NotificationType);
bindStaticMessage(StaticMessageEnum);
bindSessionType(SessionType);
bindConfigurationNamespaces(ConfigurationNamespaces);
bindStorageSystematics(STORAGE_SYSTEMATICS);
```

---

## Adding a New Runtime Binding

To expose a new decoupled provider across packages:

1. **Define the Slot and Resolver** in the domain package:

   ```typescript
   import {
     createBindingSlot,
     resolveBoundProvider,
   } from '@softsurgery/nsa-helpers';

   const customServiceSlot = createBindingSlot<Type<CustomService> | null>(
     null,
   );

   export const bindCustomService = customServiceSlot.set;
   export const getCustomService = customServiceSlot.get;

   export function resolveBoundCustomService(
     moduleRef: ModuleRef,
   ): CustomService | null {
     return resolveBoundProvider(moduleRef, getCustomService);
   }
   ```

2. **Provide in the Consuming Module**:

   ```typescript
   {
     provide: CUSTOM_SERVICE_TOKEN,
     useFactory: (moduleRef: ModuleRef) => resolveBoundCustomService(moduleRef),
     inject: [ModuleRef],
   }
   ```

3. **Bind at App Bootstrap** in `apps/api/src/bind-app-values.ts`:
   ```typescript
   import { bindCustomService } from '@softsurgery/nsa-custom';
   import { AppCustomService } from './modules/custom/app-custom.service';

   bindCustomService(AppCustomService);
   ```
