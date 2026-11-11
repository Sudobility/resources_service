/**
 * The central resources schema as a Drizzle factory: the app → language →
 * section → resource hierarchy. Lives in exactly one database (sudobility_api),
 * but is defined here so the table shapes and the wire DTOs (../types) travel
 * together and stay in sync.
 *
 * `schema` is typed loosely on purpose (as in consumables_service) to avoid
 * coupling to a drizzle-orm version. Foreign keys / ON DELETE CASCADE are owned
 * by sudobility_api's raw DDL (see its db/index.ts); the columns + primary keys
 * + query indexes are defined here.
 */
import {
  boolean,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export function createResourcesSchema(schema: any) {
  // Registered apps. The slug is the primary key and the path segment.
  const resourceApps = schema.table("resource_apps", {
    app: varchar("app", { length: 64 }).primaryKey(),
    display_name: varchar("display_name", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  });

  // Languages registered under an app. Composite PK (app, lang).
  const resourceLanguages = schema.table(
    "resource_languages",
    {
      app: varchar("app", { length: 64 }).notNull(),
      lang: varchar("lang", { length: 16 }).notNull(),
      created_at: timestamp("created_at").defaultNow().notNull(),
    },
    (t: any) => [primaryKey({ columns: [t.app, t.lang] })]
  );

  // Sections within an (app, lang). Server-generated uuid id.
  const resourceSections = schema.table(
    "resource_sections",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      app: varchar("app", { length: 64 }).notNull(),
      lang: varchar("lang", { length: 16 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      sort_order: integer("sort_order").notNull().default(0),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull(),
    },
    (t: any) => [
      index("resource_sections_app_lang_idx").on(t.app, t.lang, t.sort_order),
    ]
  );

  // Resources (tiles) within a section. Server-generated uuid id.
  const resources = schema.table(
    "resources",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      section_id: uuid("section_id").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      text: text("text").notNull().default(""),
      icon_url: text("icon_url").notNull().default(""),
      url: text("url").notNull(),
      sort_order: integer("sort_order").notNull().default(0),
      enabled: boolean("enabled").notNull().default(true),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull(),
    },
    (t: any) => [index("resources_section_idx").on(t.section_id, t.sort_order)]
  );

  return { resourceApps, resourceLanguages, resourceSections, resources };
}

export type ResourcesSchemaResult = ReturnType<typeof createResourcesSchema>;
