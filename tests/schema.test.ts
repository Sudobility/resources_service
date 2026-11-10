import { describe, it, expect } from "vitest";
import { createResourcesSchema } from "../src/schema/index.js";

describe("createResourcesSchema", () => {
  it("builds a `resources` table on the supplied schema", () => {
    const calls: Array<{ name: string; columns: string[] }> = [];
    const fakeSchema = {
      table(name: string, columns: Record<string, unknown>) {
        calls.push({ name, columns: Object.keys(columns) });
        return { __table: name, columns };
      },
    };

    const { resources } = createResourcesSchema(fakeSchema);

    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe("resources");
    expect(calls[0].columns).toEqual([
      "id",
      "app",
      "locale",
      "title",
      "text",
      "icon_url",
      "url",
      "sort_order",
      "enabled",
      "created_at",
      "updated_at",
    ]);
    expect(resources).toBeDefined();
  });
});
