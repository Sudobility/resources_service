/**
 * Wire DTOs for the Sudobility resources catalog (app → language → section →
 * resource).
 *
 * The definitions live in `@sudobility/types` (the one source shared by this
 * backend library, `sudobility_api`, and the frontend `resources_client`).
 * They are re-exported here so existing consumers of
 * `@sudobility/resources_service` keep resolving them from this package.
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
} from "@sudobility/types";
