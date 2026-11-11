/**
 * Server-to-server forwarder for the resources catalog.
 *
 * Every app API exposes its own `GET /api/v1/resources/data` and owns no
 * resources data: it proxies the aggregate read to the central sudobility_api,
 * pinning its own `app`. That ~identical proxy is written once, here.
 *
 * Reads only, so no API key. The central `/data` endpoint already sorts,
 * includes enabled resources, drops empty sections, and falls back to the
 * app's "en" data when the requested language has none.
 */
import type { ResourceDataResponse } from "../types/index.js";

export interface ResourcesForwarderConfig {
  /** Central API origin, e.g. "https://api.sudobility.com". Trailing slash ok. */
  baseUrl: string;
  /** This app's slug, pinned onto every request, e.g. "music". */
  app: string;
  /** Injected fetch (tests, non-global-fetch runtimes). Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
  /** Abort the upstream call after this many ms (default 10_000). */
  timeoutMs?: number;
  /** Base path of the central resources API (default "/resources"). */
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
    this.path = (config.path ?? "/resources").replace(/\/+$/, "");
    if (!this.fetchImpl) {
      throw new Error(
        "ResourcesForwarder: no fetch available; pass config.fetchImpl",
      );
    }
  }

  /**
   * Fetch the aggregate section→resources tree for this app and language from
   * the central API (`GET /resources/{app}/{lang}/data`). Returns the parsed
   * `{ sections }` body. Throws on a non-2xx upstream or a network/timeout
   * failure — the caller decides how to degrade.
   */
  async data(lang: string): Promise<ResourceDataResponse> {
    const url = `${this.baseUrl}${this.path}/${encodeURIComponent(
      this.app,
    )}/${encodeURIComponent(lang)}/data`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, {
        method: "GET",
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(
          `resources upstream responded ${res.status} ${res.statusText}`,
        );
      }
      const body = (await res.json()) as ResourceDataResponse;
      return { sections: Array.isArray(body?.sections) ? body.sections : [] };
    } finally {
      clearTimeout(timer);
    }
  }
}
