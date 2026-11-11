# resources_service (`@sudobility/resources_service`)

Thin backend-shared library for the Sudobility resources catalog. ESM-only
TypeScript, published to GitHub Packages, built with plain `tsc` +
`scripts/fix-esm-imports.mjs`. Bun is the package manager; Vitest runs the
tests.

## What this is (and is not)

- **Is:** shared wire DTOs, the central `resources` Drizzle schema factory, and
  a server→server `ResourcesForwarder`.
- **Is not:** a multi-tenant schema library and **not** a DB-access helper. The
  catalog lives in exactly one database (`sudobility_api`). Do not add a
  `Helper` class that runs queries here — queries belong in `sudobility_api`.

## Architecture (the "why")

The catalog is centralized. `sudobility_api` owns the table and all CRUD; its
public `GET /resources?app=&locale=` is unauthenticated, its writes need an
admin API key. Each app API (music/sudojo/svgr/characterbuilder) exposes its own
`GET /resources` that **forwards** to the central API pinning its own `app` —
that forwarder is this package's reason to exist (the frontend `resources_client`
cannot hold it; it is server→server, not browser→API).

## Conventions

- **Schema factory, consumer owns migrations.** `createResourcesSchema(schema: any)`
  builds the four hierarchy tables (`resource_apps`, `resource_languages`,
  `resource_sections`, `resources`) inside a Drizzle schema the consumer
  supplies. `schema` is `any` on purpose, to avoid coupling to a drizzle-orm
  version. FKs / ON DELETE CASCADE are owned by sudobility_api's raw DDL. Never
  add migration files here.
- **Columns are snake_case; the wire DTO is camelCase.** `sudobility_api` maps
  between them; the forwarder passes JSON through untouched.
- **The forwarder only reads.** No API key, no writes. It throws on a non-2xx
  upstream; the mounting API decides how to degrade.
- **The wire DTOs live in `@sudobility/types`** (next to the `consumables`
  contract) — the one source shared by this library, `sudobility_api`, and the
  frontend `resources_client`. `types/index.ts` here only re-exports them, so
  existing consumers of this package keep resolving them. Only the Drizzle
  schema factory (`createResourcesSchema`, needs `drizzle-orm`) and the
  forwarder stay in this package.

## Build & test

- `bun run verify` before every push: typecheck → lint → `vitest run` → build.
- Build is `tsc -p tsconfig.esm.json && node scripts/fix-esm-imports.mjs`. The
  fixer rewrites extensionless relative specifiers so Node's ESM loader accepts
  the output — it is generic; don't edit it.
- Tests live in `tests/*.test.ts` under Vitest. Never run `bun test` (that is
  Bun's own runner).

## Publishing

CI delegates to `johnqh/workflows/.github/workflows/unified-cicd.yml@main` with
`publish-target: github`. Push to `main` publishes. Consuming repos then bump
the dep and re-verify.
