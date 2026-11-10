import { describe, it, expect, vi } from "vitest";
import { ResourcesForwarder } from "../src/forwarder/index.js";
import type { ResourceListResponse } from "../src/types/index.js";

function jsonResponse(body: unknown, init: Partial<Response> = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: async () => body,
  } as unknown as Response;
}

const sample: ResourceListResponse = {
  resources: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      app: "music",
      locale: "en",
      title: "Learn Theory",
      text: "Music theory basics",
      iconUrl: "https://example.com/favicon.png",
      url: "https://example.com/theory",
      sortOrder: 0,
      enabled: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("ResourcesForwarder", () => {
  it("pins app and locale as query params and returns the parsed body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(sample));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com/",
      app: "music",
      fetchImpl,
    });

    const result = await forwarder.list("en");

    expect(result).toEqual(sample);
    const calledUrl = new URL(fetchImpl.mock.calls[0][0] as string);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      "https://api.sudobility.com/resources",
    );
    expect(calledUrl.searchParams.get("app")).toBe("music");
    expect(calledUrl.searchParams.get("locale")).toBe("en");
  });

  it("omits locale when not supplied", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(sample));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com",
      app: "svgr",
      fetchImpl,
    });

    await forwarder.list();

    const calledUrl = new URL(fetchImpl.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("app")).toBe("svgr");
    expect(calledUrl.searchParams.has("locale")).toBe(false);
  });

  it("throws on a non-2xx upstream response", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(null, { ok: false, status: 502, statusText: "Bad Gateway" }),
      );
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com",
      app: "music",
      fetchImpl,
    });

    await expect(forwarder.list("en")).rejects.toThrow(/502/);
  });

  it("coerces a malformed body into an empty list", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ nope: true }));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com",
      app: "music",
      fetchImpl,
    });

    expect(await forwarder.list("en")).toEqual({ resources: [] });
  });
});
