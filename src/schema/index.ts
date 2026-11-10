/**
 * The central `resources` table, as a Drizzle schema factory.
 *
 * Unlike a multi-tenant schema library, this shape lives in exactly one
 * database — `sudobility_api`'s. It is still defined here, rather than inline in
 * that API, so the table shape and the wire DTOs (../types) travel together and
 * stay in sync, and so the house convention ("the library owns the shape, the
 * API owns the DDL") holds.
 *
 * `schema` is typed loosely on purpose (as in `consumables_service`) to avoid
 * coupling this library to a specific drizzle-orm version: the consumer passes
 * either a named `PgSchema` or `{ table: pgTable }`.
 */
import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export function createResourcesSchema(schema: any) {
  const resources = schema.table(
    "resources",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      app: varchar("app", { length: 64 }).notNull(),
      locale: varchar("locale", { length: 16 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      text: text("text").notNull().default(""),
      icon_url: text("icon_url").notNull().default(""),
      url: text("url").notNull(),
      sort_order: integer("sort_order").notNull().default(0),
      enabled: boolean("enabled").notNull().default(true),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull(),
    },
    (table: any) => [
      // The public read is always `WHERE app = ? AND locale = ? AND enabled`
      // ordered by sort_order — this index serves exactly that.
      index("resources_app_locale_idx").on(
        table.app,
        table.locale,
        table.sort_order,
      ),
    ],
  );

  return { resources };
}

export type ResourcesSchemaResult = ReturnType<typeof createResourcesSchema>;
