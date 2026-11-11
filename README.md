# @sudobility/resources_service

Thin **backend-shared** library for the Sudobility *resources catalog* — the
per-app, per-language, sectioned list of helper-link tiles each app shows.

The catalog is a hierarchy: **app → language → section → resource**. It lives in
one database (the central `sudobility_api` at `api.sudobility.com`); this package
is not a multi-tenant schema library. It ships three things:

| Export | Used by | Purpose |
| --- | --- | --- |
| DTOs (`ResourceApp`, `ResourceSection`, `Resource`, `ResourceDataResponse`, inputs/patches, list responses) | everyone | the camelCase wire shapes |
| `createResourcesSchema(schema)` | `sudobility_api` only | the four Drizzle tables (`resource_apps`, `resource_languages`, `resource_sections`, `resources`); the API owns the DDL/cascades |
| `ResourcesForwarder` | every app API | a server-to-server proxy for the app's public `/data` read |

There is **no DB helper class** here: the catalog lives in one API, which owns
its own queries.

## The forwarder (app APIs)

Each app API owns no data — it proxies the aggregate read to the central API,
pinning its own `app`:

```ts
import { ResourcesForwarder } from "@sudobility/resources_service";

const forwarder = new ResourcesForwarder({
  baseUrl: process.env.SUDOBILITY_API_URL ?? "https://api.sudobility.com",
  app: "music",
});

// In your GET /api/v1/resources/data handler:
const { sections } = await forwarder.data(lang); // -> central GET /resources/music/{lang}/data
return c.json({ sections });
```

Reads are public, so no API key. `/data` returns sections sorted by `sortOrder`,
each with its enabled resources sorted by `sortOrder`, empty sections dropped,
falling back to the app's `en` data when the requested language has none.

## The schema (central API only)

```ts
import { createResourcesSchema } from "@sudobility/resources_service";
import { pgTable } from "drizzle-orm/pg-core";

export const { resourceApps, resourceLanguages, resourceSections, resources } =
  createResourcesSchema({ table: pgTable });
// sudobility_api owns the CREATE TABLE DDL + ON DELETE CASCADE down the chain.
```

## Related

- `sudobility_api` (private) — owns the tables, the nested REST CRUD, the `/data`
  aggregate, the MCP + skill
- `resources_client` — the frontend network lib (web + RN)
- `resources_pages` / `resources_pages_rn` — the sectioned tile UI
