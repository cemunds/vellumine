import type { z } from "zod";
import type {
  TypesenseCollection,
  CreateTypesenseCollection,
  UpdateTypesenseCollection,
} from "#shared/parsers/collection";

export type TypesenseCollection = z.infer<typeof TypesenseCollection>;

export type CreateTypesenseCollection = z.infer<
  typeof CreateTypesenseCollection
>;

export type UpdateTypesenseCollection = z.infer<
  typeof UpdateTypesenseCollection
>;
