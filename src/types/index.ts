/**
 * Shared resource DTOs for the Sudobility resources catalog.
 *
 * These are the JSON contract between the central `sudobility_api`, the
 * per-app forwarders (see ../forwarder), and — by duplication, not import — the
 * frontend `resources_client`. The contract is deliberately small and plain so
 * that neither the frontend nor an app API has to depend on this backend
 * library's Drizzle surface just to name a resource.
 *
 * Casing is camelCase on the wire. The central API maps its snake_case columns
 * (see ../schema) to this shape before serializing; a forwarder passes the JSON
 * through untouched.
 */

/** A single catalog entry, as served by the public read endpoint. */
export interface Resource {
  /** Stable identifier (UUID). */
  id: string;
  /** Owning application, e.g. "music", "sudojo", "svgr", "characterbuilder". */
  app: string;
  /** BCP-47-ish language tag the row is written for, e.g. "en", "zh". */
  locale: string;
  /** Short display title. */
  title: string;
  /** One- or two-line description shown under the title. */
  text: string;
  /** URL of the tile icon — usually the highest-resolution favicon of `url`. */
  iconUrl: string;
  /** Target the tile opens when tapped/clicked. */
  url: string;
  /** Ascending display order within an (app, locale). */
  sortOrder: number;
  /** When false the row is hidden from the public read endpoint. */
  enabled: boolean;
  /** ISO-8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/**
 * The writable fields of a resource, used by the admin create/update endpoints
 * and the MCP. `id`, `createdAt` and `updatedAt` are owned by the server.
 */
export interface ResourceInput {
  app: string;
  locale: string;
  title: string;
  text: string;
  iconUrl: string;
  url: string;
  sortOrder?: number;
  enabled?: boolean;
}

/** A partial update — every field optional. */
export type ResourcePatch = Partial<ResourceInput>;

/** The public read endpoint's response body. */
export interface ResourceListResponse {
  resources: Resource[];
}
