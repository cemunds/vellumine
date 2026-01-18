import { z } from "zod";

export const TypesenseCollection = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().nullable(),
  ghostAdminUrl: z.url().nonempty(),
  ghostAdminApiKey: z.string().min(1, "Content API key is required"),
  typesenseSearchKey: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSyncAt: z.date().nullable(),
  syncStatus: z.string().nullable(),
  syncError: z.string().nullable(),
  postCount: z.number(),
  pageCount: z.number(),
  webhookSecret: z.string(),
});

export const CreateTypesenseCollection = TypesenseCollection.pick({
  name: true,
  description: true,
  ghostAdminUrl: true,
  ghostAdminApiKey: true,
  webhookSecret: true,
});

export const UpdateTypesenseCollection = TypesenseCollection.pick({
  name: true,
  description: true,
  ghostAdminApiKey: true,
  typesenseSearchKey: true,
}).partial();

export const CollectionConfig = z.object({
  stopwords: z.array(z.string()),
  theme: z.string(),
  language: z.string(),
  highlightColor: z.string(),
  apiKey: z.string(),
  labels: z.object({
    searchPlaceholder: z.string(),
    commonSearchesTitle: z.string(),
    emptyStateMessage: z.string(),
    loadingMessage: z.string(),
    noResultsMessage: z.string(),
    navigateHint: z.string(),
    closeHint: z.string(),
    ariaSearchLabel: z.string(),
    ariaCloseLabel: z.string(),
    ariaResultsLabel: z.string(),
    ariaArticleExcerpt: z.string(),
    ariaModalLabel: z.string(),
    untitledPost: z.string(),
  }),
});
