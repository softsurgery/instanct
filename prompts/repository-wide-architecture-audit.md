# Mission: Repository-Wide Architecture Audit, Standardization & Refactoring

You are acting as a **Senior Staff Engineer, Monorepo Architect, and TypeScript Infrastructure Specialist**.

Your task is to perform a comprehensive architectural audit of this entire repository, identify inconsistencies, duplication, configuration problems, dependency-management issues, and architectural violations, and then systematically repair them.

This is not a superficial cleanup. The objective is to establish a clean, maintainable, scalable, consistent monorepo architecture with a single source of truth wherever possible.

You have permission to modify files when necessary, but every change must be justified by an actual architectural improvement.

---

## 1. Understand the repository before modifying anything

First, inspect the entire repository.

The architecture includes:

- `apps/web`: Next.js Pages Router backoffice.
- `apps/landing`: Next.js App Router marketing website.
- `apps/mobile`: Expo / React Native application.
- `apps/api`: NestJS, TypeORM, MySQL backend.
- `packages/`: Git submodule pointing to the separately maintained `softsurgery-abstractions` repository.
- `infra/`: Infrastructure configuration.
- `scripts/`: Repository tooling and automation.

The repository uses:

- pnpm workspaces.
- Turborepo.
- TypeScript.
- Node.js >= 22.
- pnpm version 11.25.0.
- Shared `@softsurgery/*` and `@softsurgery/nsa-*` packages.

Do not assume that the existing documentation is perfectly accurate. Verify everything against the actual source files.

Before making changes:

1. Inspect the root configuration.
2. Inspect every application configuration.
3. Inspect every shared package configuration.
4. Inspect the Git submodule configuration and repository state.
5. Inspect package manifests and dependency relationships.
6. Inspect build, lint, formatting, and type-check scripts.
7. Identify configuration duplication and conflicting conventions.

Create an internal understanding of the dependency graph and architecture before refactoring.

## 2. TypeScript configuration: establish a single source of truth

Audit every `tsconfig.json`, `tsconfig.*.json`, and related TypeScript configuration.

The objective is to eliminate duplicated compiler configuration.

Requirements:

- Establish centralized reusable TypeScript configurations.
- Create shared base configurations for common compiler settings.
- Keep application-specific configurations only when technically necessary.
- Use `extends` consistently.
- Eliminate duplicated compiler options.
- Standardize module resolution, strictness, path handling, and declaration settings where compatible.
- Avoid unnecessary path aliases.
- Ensure shared packages resolve correctly across all applications.
- Ensure Next.js, Expo, NestJS, and Node.js tooling retain their required framework-specific settings.
- Avoid forcing incompatible module systems or compiler settings into a universal configuration.
- Ensure TypeScript project references are used only where they provide a real benefit.
- Avoid circular configuration inheritance.

The target should be a minimal configuration hierarchy with a clear ownership model.

Do not blindly force all applications to use identical settings. Standardize what can genuinely be shared and isolate what must remain application-specific.

## 3. pnpm and workspace configuration: centralize everything possible

Audit all pnpm-related configuration, including:

- `pnpm-workspace.yaml`
- Root `package.json`
- Application `package.json` files.
- Shared package manifests.
- `.npmrc`
- `pnpm-lock.yaml`
- Package manager version declarations.
- Dependency overrides.
- Peer dependency rules.
- Workspace dependency declarations.
- Build and install scripts.
- Turbo configuration.

Objectives:

- Establish one authoritative workspace definition.
- Remove duplicated package-manager configuration.
- Standardize dependency version management.
- Use workspace protocols correctly.
- Use centralized dependency catalogs where appropriate and supported.
- Eliminate inconsistent dependency versions unless there is a documented technical reason.
- Avoid unnecessary overrides and resolutions.
- Standardize scripts and naming conventions.
- Ensure internal dependencies use `workspace:` where appropriate.
- Ensure shared packages are correctly recognized as workspace packages.
- Ensure the lockfile remains consistent with the manifests.
- Preserve compatibility with pnpm 11.25.0.

Do not introduce a dependency-management abstraction that adds complexity without providing measurable value.

## 4. Git submodule: treat it as a first-class maintained repository

The `packages/` directory is a Git submodule pointing to:

`softsurgery/softsurgery-abstractions`

This repository is independently maintained and contains shared abstractions used by multiple applications.

You must inspect it as part of the architectural audit.

Requirements:

- Understand its package structure and exports.
- Audit its TypeScript configurations.
- Audit its package manifests.
- Audit its dependency relationships.
- Identify duplicated utilities or abstractions between the monorepo and the submodule.
- Identify incorrect package boundaries.
- Identify missing or inconsistent workspace integration.
- Verify that applications consume shared abstractions rather than reimplementing them.
- Check for broken or inconsistent package exports.
- Check whether package dependencies and peer dependencies are declared correctly.

Important Git rules:

- Respect the submodule's independent Git history.
- Do not replace it with a copied directory.
- Do not remove or reinitialize it unnecessarily.
- Do not silently change the pinned submodule commit.
- If a change is needed inside the submodule, treat it as a separate repository change.
- Identify which changes belong to the main repository and which belong to `softsurgery-abstractions`.
- Do not commit or push either repository without explicit authorization.

The goal is to make the monorepo and its shared repository work together as one coherent architecture while preserving their independent ownership.

## 5. Eliminate duplication

Perform a repository-wide duplication audit.

Look for:

- Duplicate TypeScript configurations.
- Duplicate dependencies and version declarations.
- Duplicate npm/pnpm scripts.
- Duplicate build configurations.
- Duplicate ESLint and Prettier configurations.
- Duplicate API clients.
- Duplicate utilities and helpers.
- Repeated environment configuration.
- Repeated constants and types.
- Repeated abstractions already available in `@softsurgery/*`.
- Repeated configuration patterns between applications.
- Dead configuration files.
- Unused dependencies.
- Unused packages and scripts.

For every duplication:

1. Identify its occurrences.
2. Determine whether it represents legitimate application-specific behavior.
3. If it is genuinely shared, identify the correct owner.
4. Consolidate it into the appropriate shared location.
5. Update consumers.
6. Remove obsolete implementations.

Do not create shared abstractions simply because two pieces of code look similar.

Avoid overengineering and unnecessary indirection.

The objective is a single source of truth, not an excessive abstraction layer.

## 6. Dependency architecture

Inspect all dependencies throughout the monorepo and submodule.

Identify:

- Multiple versions of the same dependency.
- Incorrect dependency placement.
- Dependencies declared in the root unnecessarily.
- Missing peer dependencies.
- Missing development dependencies.
- Incorrect workspace references.
- Circular package dependencies.
- Unused dependencies.
- Framework version inconsistencies.
- React and React Native compatibility issues.
- Expo SDK compatibility issues.
- Next.js compatibility issues.
- NestJS compatibility issues.

Centralize versions where appropriate.

Preserve dependencies that genuinely require different versions for compatibility.

Never upgrade major framework versions simply to make version numbers consistent.

## 7. Turborepo and scripts

Audit `turbo.json` and all package scripts.

Ensure:

- Build dependencies are correctly defined.
- Type-check tasks respect the dependency graph.
- Linting is consistent.
- Development tasks do not accidentally execute one-shot jobs.
- Data-flow jobs are not unintentionally included in generic development workflows.
- Cache behavior is correct.
- Outputs are properly declared.
- Scripts are not unnecessarily duplicated.

Establish a predictable root-level developer experience.

## 8. Environment and infrastructure configuration

Inspect:

- `.env.example` files.
- Dockerfiles.
- Docker Compose files.
- Nginx configuration.
- Build arguments.
- Runtime environment variables.
- Scripts.
- CI configuration, if present.

Identify duplicated settings and inconsistent conventions.

Centralize shared configuration only when doing so preserves application isolation and deployment correctness.

Never expose secrets or move sensitive runtime values into public configuration.

## 9. Architecture and package boundaries

Verify that responsibilities are correctly distributed.

Applications should consume shared abstractions instead of duplicating functionality.

Shared packages should contain reusable functionality without depending on concrete application implementations.

Avoid circular dependencies between applications and shared packages.

Respect existing architectural conventions, including:

- NestJS repository and service abstractions.
- Runtime dependency bindings.
- Shared API client.
- Shared form builders.
- Shared data-table builder.
- Shared UI abstractions.
- Shared hooks and utilities.

Do not rewrite working business logic just to achieve stylistic consistency.

## 10. Refactoring strategy

Work incrementally.

### Phase A — Discovery

Produce a complete audit report containing:

- Existing architecture.
- Configuration inventory.
- Duplication inventory.
- Dependency inconsistencies.
- Git submodule findings.
- Architectural violations.
- Risks and potential breaking changes.

### Phase B — Proposed architecture

Define the target architecture.

Specify:

- Which configuration files should exist.
- Which configurations should extend others.
- Where dependency versions should be managed.
- How workspace packages should be declared.
- Which responsibilities belong to the root, applications, and submodule.
- Which duplicated implementations should be consolidated.

Explain important decisions before implementing them.

### Phase C — Implementation

Implement the approved architecture systematically.

For each change:

- Keep the scope controlled.
- Preserve existing application behavior.
- Remove obsolete files only after verifying they are unused.
- Update all affected references.
- Keep the lockfile synchronized.
- Avoid unrelated feature changes.

### Phase D — Validation

Validate the result.

At minimum:

- pnpm install.
- Workspace package resolution.
- TypeScript checks.
- ESLint checks.
- Production builds.
- Relevant unit tests.
- Expo configuration validation.
- Dependency consistency.
- Git submodule integrity.

Run checks for individual applications where necessary.

Do not claim something passes unless you actually executed the corresponding check.

If an existing issue prevents validation, distinguish it from issues introduced by your changes.

### Phase E — Final report

Produce a report containing:

1. Problems discovered.
2. Root causes.
3. Files modified.
4. Files removed.
5. New shared configurations.
6. Dependency changes.
7. Main repository changes.
8. Submodule changes.
9. Validation results.
10. Remaining technical debt.
11. Any decisions requiring human approval.

---

## 11. Non-negotiable engineering rules

- No speculative refactoring.
- No unnecessary dependencies.
- No duplicated configuration without justification.
- No silent framework upgrades.
- No destructive Git operations.
- No changes to Git history.
- No accidental submodule pointer updates.
- No deletion of files without checking references.
- No breaking changes without identifying their impact.
- No fake validation results.
- No hardcoded configuration when a legitimate shared source of truth exists.
- No abstraction for the sake of abstraction.

Prioritize correctness, simplicity, maintainability, and consistency.

## Final objective

Transform this repository into a professionally structured monorepo where:

- Configuration has a clear single source of truth.
- Dependency management is predictable.
- Shared abstractions are genuinely shared.
- Applications remain independently understandable.
- The Git submodule integrates cleanly.
- Duplication is minimized.
- TypeScript and pnpm configuration are maintainable.
- Adding a new application or shared package does not require copying configuration from existing applications.

**Think like an architect, investigate like an auditor, and implement like an engineer responsible for maintaining this codebase for the next five years.**
