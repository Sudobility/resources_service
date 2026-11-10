/**
 * Server-to-server forwarder for the resources catalog.
 *
 * Every app API (music_api, sudojo_api, svgr_api, characterbuilder_api) exposes
 * its own `GET /resources`, but owns no resources data: it proxies the read to
 * the central `sudobility_api` at api.sudobility.com, pinning its own `app`.
 * That ~identical proxy is written once, here, and mounted by each API.
 *
 * Reads are public, so no API key is involved — the forwarder only ever reads.
 * Writes (POST/PUT/DELETE) are never proxied; they go directly to the central
 * API with its admin key and are not part of any app's surface.
 *
 * This is deliberately framework-agnostic (plain async methods over `fetch`),
 * so a Hono/Express/whatever route can call it and shape its own response.
 */
import type { ResourceListResponse } from "../types/index.js";

export interface ResourcesForwarderConfig {
  /** Central API origin, e.g. "https://api.sudobility.com". Trailing slash ok. */
  baseUrl: string;
  /** This app's identifier, pinned onto every request, e.g. "music". */
  app: string;
  /** Injected fetch (tests, non-global-fetch runtimes). Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
  /** Abort the upstream call after this many ms (default 10_000). */
  timeoutMs?: number;
  /** Path of the central read endpoint (default "/resources"). */
  path?: string;
}

export class ResourcesForwarder {
  private readonly baseUrl: string;
  private readonly app: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly path: string;

  constructor(config: ResourcesForwarderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.app = config.app;
    this.fetchImpl = config.fetchImpl ?? (globalThis.fetch as typeof fetch);
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.path = config.path ?? "/resources";
    if (!this.fetchImpl) {
      throw new Error(
        "ResourcesForwarder: no fetch available; pass config.fetchImpl",
      );
    }
  }

  /**
   * Fetch the enabled resources for this app and (optional) locale from the
   * central API. Returns the parsed `{ resources }` body. Throws on a non-2xx
   * upstream response or a network/timeout failure — the caller decides how to
   * degrade (e.g. empty list vs. 502).
   */
  async list(locale?: string): Promise<ResourceListResponse> {
    const url = new URL(`${this.baseUrl}${this.path}`);
    url.searchParams.set("app", this.app);
    if (locale) url.searchParams.set("locale", locale);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(
          `resources upstream responded ${res.status} ${res.statusText}`,
        );
      }
      const body = (await res.json()) as ResourceListResponse;
      return { resources: Array.isArray(body?.resources) ? body.resources : [] };
    } finally {
      clearTimeout(timer);
    }
  }
}
