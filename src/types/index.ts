/**
 * Shared wire DTOs for the Sudobility resources catalog.
 *
 * The catalog is a hierarchy: app → language → section → resource.
 *   - an **app** is a slug (e.g. "music") plus a display name
 *   - a **language** is a locale code (e.g. "en") registered under an app
 *   - a **section** has a server-generated id, a title and a sort order
 *   - a **resource** is a tile (title, text, icon, url) under a section
 *
 * camelCase on the wire. The central API maps its snake_case columns to these;
 * a forwarder passes the JSON through untouched. These are redeclared (not
 * imported) by the frontend `resources_client`, so it never depends on this
 * backend library.
 */

/** A registered app. The slug is the id used in every path. */
export interface ResourceApp {
  app: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

/** A tile under a section. */
export interface Resource {
  id: string;
  title: string;
  text: string;
  iconUrl: string;
  url: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A section's metadata (no resources). */
export interface ResourceSection {
  id: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** A section together with its resources (used by the admin section GET). */
export interface ResourceSectionWithResources extends ResourceSection {
  resources: Resource[];
}

/**
 * The aggregate public read: the whole (app, lang) tree in one response.
 * Sections sorted by sortOrder, each with its enabled resources sorted by
 * sortOrder; empty sections are omitted; falls back to the app's "en" data
 * when the requested language has none.
 */
export interface ResourceDataResponse {
  sections: ResourceSectionWithResources[];
}

/** List responses (keyed envelopes, matching the house style). */
export interface ResourceAppListResponse {
  apps: ResourceApp[];
}
export interface ResourceLanguageListResponse {
  languages: string[];
}
export interface ResourceSectionListResponse {
  sections: ResourceSection[];
}

// ---- Write payloads ----

export interface ResourceAppInput {
  app: string;
  displayName: string;
}

export interface ResourceLanguageInput {
  lang: string;
}

export interface ResourceSectionInput {
  title: string;
  sortOrder?: number;
}
export type ResourceSectionPatch = Partial<ResourceSectionInput>;

export interface ResourceInput {
  title: string;
  text?: string;
  iconUrl?: string;
  url: string;
  sortOrder?: number;
  enabled?: boolean;
}
export type ResourcePatch = Partial<ResourceInput>;
