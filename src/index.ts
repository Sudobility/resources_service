/**
 * @sudobility/resources_service
 *
 * Thin backend-shared library for the Sudobility resources catalog:
 *  - the wire DTOs (`Resource`, `ResourceInput`, `ResourcePatch`, `ResourceListResponse`)
 *  - the central Drizzle schema factory (`createResourcesSchema`), used only by sudobility_api
 *  - the server-to-server `ResourcesForwarder` each app API mounts for its own GET /resources
 *
 * There is no DB "helper" class here (unlike consumables_service): the table
 * lives in exactly one API, which owns its own queries.
 */
export type {
  Resource,
  ResourceInput,
  ResourcePatch,
  ResourceListResponse,
} from "./types/index.js";

export {
  createResourcesSchema,
  type ResourcesSchemaResult,
} from "./schema/index.js";

export {
  ResourcesForwarder,
  type ResourcesForwarderConfig,
} from "./forwarder/index.js";
