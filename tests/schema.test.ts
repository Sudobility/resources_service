import { describe, it, expect } from "vitest";
import { createResourcesSchema } from "../src/schema/index.js";

describe("createResourcesSchema", () => {
  it("builds the four hierarchy tables with the expected columns", () => {
    const built: Record<string, string[]> = {};
    const fakeSchema = {
      table(name: string, columns: Record<string, unknown>) {
        built[name] = Object.keys(columns);
        return { __table: name, columns };
      },
    };

    const result = createResourcesSchema(fakeSchema);

    expect(Object.keys(built).sort()).toEqual([
      "resource_apps",
      "resource_languages",
      "resource_sections",
      "resources",
    ]);
    expect(built["resource_apps"]).toEqual([
      "app",
      "display_name",
      "created_at",
      "updated_at",
    ]);
    expect(built["resource_languages"]).toEqual(["app", "lang", "created_at"]);
    expect(built["resource_sections"]).toEqual([
      "id",
      "app",
      "lang",
      "title",
      "sort_order",
      "created_at",
      "updated_at",
    ]);
    expect(built["resources"]).toEqual([
      "id",
      "section_id",
      "title",
      "text",
      "icon_url",
      "url",
      "sort_order",
      "enabled",
      "created_at",
      "updated_at",
    ]);
    expect(result.resourceApps).toBeDefined();
    expect(result.resources).toBeDefined();
  });
});
