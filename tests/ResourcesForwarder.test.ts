import { describe, it, expect, vi } from "vitest";
import { ResourcesForwarder } from "../src/forwarder/index.js";
import type { ResourceDataResponse } from "../src/types/index.js";

function jsonResponse(body: unknown, init: Partial<Response> = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: async () => body,
  } as unknown as Response;
}

const sample: ResourceDataResponse = {
  sections: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Sheet music",
      sortOrder: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      resources: [
        {
          id: "22222222-2222-2222-2222-222222222222",
          title: "MuseScore",
          text: "Community sheet music",
          iconUrl: "https://example.com/favicon.png",
          url: "https://musescore.com",
          sortOrder: 0,
          enabled: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    },
  ],
};

describe("ResourcesForwarder", () => {
  it("requests /resources/{app}/{lang}/data and returns the parsed body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(sample));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com/",
      app: "music",
      fetchImpl,
    });

    const result = await forwarder.data("en");

    expect(result).toEqual(sample);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      "https://api.sudobility.com/resources/music/en/data",
    );
  });

  it("url-encodes app and lang", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ sections: [] }));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com",
      app: "svgr",
      fetchImpl,
    });
    await forwarder.data("zh-hant");
    expect(fetchImpl.mock.calls[0][0]).toBe(
      "https://api.sudobility.com/resources/svgr/zh-hant/data",
    );
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
    await expect(forwarder.data("en")).rejects.toThrow(/502/);
  });

  it("coerces a malformed body into empty sections", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ nope: true }));
    const forwarder = new ResourcesForwarder({
      baseUrl: "https://api.sudobility.com",
      app: "music",
      fetchImpl,
    });
    expect(await forwarder.data("en")).toEqual({ sections: [] });
  });
});
