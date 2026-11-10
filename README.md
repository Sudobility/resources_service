# @sudobility/resources_service

Thin **backend-shared** library for the Sudobility *resources catalog* — the
language-specific list of helper links each app shows as tiles.

It is intentionally small. The catalog lives in exactly one database (the
central `sudobility_api` at `api.sudobility.com`); this package is not a
multi-tenant schema library. It ships three things:

| Export | Used by | Purpose |
| --- | --- | --- |
| `Resource`, `ResourceInput`, `ResourcePatch`, `ResourceListResponse` | everyone | the camelCase wire DTOs |
| `createResourcesSchema(schema)` | `sudobility_api` only | the central `resources` Drizzle table (the API owns the DDL/migrations) |
| `ResourcesForwarder` | every app API | a server-to-server proxy for `GET /resources` → central API |

There is **no DB helper class** here (unlike `consumables_service`): the table
lives in one API, which owns its own queries.

## Install

```bash
# .npmrc already scopes @sudobility to GitHub Packages; a read:packages token
# must be in your user ~/.npmrc.
bun add @sudobility/resources_service
```

## The forwarder (app APIs)

Each app API owns no resources data — it proxies the public read to the central
API, pinning its own `app`:

```ts
import { ResourcesForwarder } from "@sudobility/resources_service";

const forwarder = new ResourcesForwarder({
  baseUrl: process.env.SUDOBILITY_API_URL ?? "https://api.sudobility.com",
  app: "music",
});

// In your GET /resources handler:
const { resources } = await forwarder.list(locale); // locale from the request
return c.json({ resources });
```

Reads are public, so no API key is involved. Writes are never proxied — they go
straight to `sudobility_api` with its admin key.

## The schema (central API only)

```ts
import { createResourcesSchema } from "@sudobility/resources_service";
import { pgTable } from "drizzle-orm/pg-core";

export const { resources } = createResourcesSchema({ table: pgTable });
// sudobility_api owns the CREATE TABLE DDL — see its init/migrations.
```

Columns: `id, app, locale, title, text, icon_url, url, sort_order, enabled,
created_at, updated_at`. One row = one (app, locale) entry.

## Scripts

- `bun run verify` — typecheck + lint + unit tests + build (run before pushing)
- `bun run build` — `tsc` to ESM `dist/` + `fix-esm-imports.mjs`
- `bun run test:unit` — Vitest (do **not** run `bun test`)

## Related

- `sudobility_api` (private) — owns the table, the write endpoints, the MCP + skill
- `resources_client` — the frontend network lib (web + RN)
- `resources_pages` / `resources_pages_rn` — the tile UI (web / React Native)
