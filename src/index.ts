/**
 * @sudobility/resources_service
 *
 * Thin backend-shared library for the Sudobility resources catalog (the
 * app → language → section → resource hierarchy):
 *  - the wire DTOs
 *  - the central Drizzle schema factory (`createResourcesSchema`), used only by sudobility_api
 *  - the server-to-server `ResourcesForwarder` each app API mounts for its own
 *    public `GET /api/v1/resources/data` read
 *
 * No DB "helper" class (unlike consumables_service): the catalog lives in
 * exactly one API, which owns its own queries.
 */
export type {
  ResourceApp,
  Resource,
  ResourceSection,
  ResourceSectionWithResources,
  ResourceDataResponse,
  ResourceAppListResponse,
  ResourceLanguageListResponse,
  ResourceSectionListResponse,
  ResourceAppInput,
  ResourceLanguageInput,
  ResourceSectionInput,
  ResourceSectionPatch,
  ResourceInput,
  ResourcePatch,
} from "./types/index.js";

export {
  createResourcesSchema,
  type ResourcesSchemaResult,
} from "./schema/index.js";

export {
  ResourcesForwarder,
  type ResourcesForwarderConfig,
} from "./forwarder/index.js";
