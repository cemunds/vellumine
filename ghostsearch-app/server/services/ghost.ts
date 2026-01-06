import { TSGhostContentAPI } from "@ts-ghost/content-api";
import consola from "consola";
import { createError } from "h3";
import { collectionService } from "./collection";
import { db } from "../db";
import { collectionRepository } from "../db/repositories/collection";
import { syncHistory, collection } from "../db/schema";
import { eq } from "drizzle-orm";

interface GhostServiceConfig {
  url: string;
  contentApiKey: string;
  adminApiKey?: string;
}

export class GhostService {
  private config: GhostServiceConfig;
  private contentClient: TSGhostContentAPI;

  constructor(config: GhostServiceConfig) {
    this.config = config;
    this.contentClient = new TSGhostContentAPI(
      config.url,
      config.contentApiKey,
      "v5.0" as const,
    );
  }

  /**
   * Validate Ghost Content API key by making a test request
   */
  async validateContentApiKey(): Promise<boolean> {
    try {
      const response = await this.contentClient.posts
        .browse({ limit: 1 })
        .fetch();

      return response.success;
    } catch (error: any) {
      consola.error("Ghost API validation failed:", error.message);
      return false;
    }
  }

  /**
   * Fetch all posts with pagination
   */
  async fetchAllPosts(): Promise<any[]> {
    let allPosts: any[] = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await this.contentClient.posts
          .browse({
            limit: 15,
            page,
          })
          .include({ tags: true, authors: true })
          .fetch();

        if (!response.success) {
          const errors = response.errors || [];
          const errorMessage = errors
            .map((e: any) => e.message || e)
            .join(", ");
          throw new Error(
            `Ghost API error: ${errorMessage || "Unknown error"}`,
          );
        }

        allPosts = allPosts.concat(response.data);

        const total = response.meta.pagination.total;
        const limit = response.meta.pagination.limit as number;
        const totalPages = Math.ceil(total / limit);

        hasMore = page < totalPages;
        page++;
      }

      consola.success(`Fetched ${allPosts.length} posts from Ghost`);
      return allPosts;
    } catch (error: any) {
      consola.error("Failed to fetch posts:", error.message);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  /**
   * Fetch all pages with pagination
   */
  async fetchAllPages(): Promise<any[]> {
    let allPages: any[] = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await this.contentClient.pages
          .browse({
            limit: 15,
            page,
          })
          .include({ tags: true, authors: true })
          .fetch();

        if (!response.success) {
          const errors = response.errors || [];
          const errorMessage = errors
            .map((e: any) => e.message || e)
            .join(", ");
          throw new Error(
            `Ghost API error: ${errorMessage || "Unknown error"}`,
          );
        }

        allPages = allPages.concat(response.data);

        const total = response.meta.pagination.total;
        const limit = response.meta.pagination.limit as number;
        const totalPages = Math.ceil(total / limit);

        hasMore = page < totalPages;
        page++;
      }

      consola.success(`Fetched ${allPages.length} pages from Ghost`);
      return allPages;
    } catch (error: any) {
      consola.error("Failed to fetch pages:", error.message);
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }
  }

  /**
   * Sync all content from Ghost to Typesense
   */
  async syncContent(collectionId: string): Promise<void> {
    try {
      // Start sync record
      const syncRecord = await db
        .insert(syncHistory)
        .values({
          collectionId,
          status: "started",
        })
        .returning();

      const syncId = syncRecord[0].id;

      // Fetch all posts and pages
      const [posts, pages] = await Promise.all([
        this.fetchAllPosts(),
        this.fetchAllPages(),
      ]);

      // Transform and index posts
      const postDocuments = posts.map((post: any) =>
        collectionService.transformPost(post),
      );

      // Transform and index pages
      const pageDocuments = pages.map((page: any) => {
        const pageWithType = { ...page, type: "page" };
        return collectionService.transformPost(pageWithType);
      });

      // Index all documents
      const allDocuments = [...postDocuments, ...pageDocuments];
      await collectionService.indexDocumentsBatched(collectionId, allDocuments);

      // Update collection stats using direct DB update
      await db
        .update(collection)
        .set({
          postCount: posts.length,
          pageCount: pages.length,
          lastSyncAt: new Date(),
          syncStatus: "completed",
          syncError: null,
        })
        .where(eq(collection.id, collectionId));

      // Complete sync record
      await db
        .update(syncHistory)
        .set({
          status: "completed",
          completedAt: new Date(),
          postsProcessed: posts.length,
          pagesProcessed: pages.length,
          postsSuccess: posts.length,
          pagesSuccess: pages.length,
        })
        .where(eq(syncHistory.id, syncId));

      consola.success("Content sync completed successfully");
    } catch (error: any) {
      consola.error("Content sync failed:", error.message);

      // Update collection with error using direct DB update
      await db
        .update(collection)
        .set({
          syncStatus: "error",
          syncError: error.message,
        })
        .where(eq(collection.id, collectionId));

      throw new Error(`Content sync failed: ${error.message}`);
    }
  }

  /**
   * Handle webhook event from Ghost
   */
  async handleWebhookEvent(event: any, collectionId: string): Promise<void> {
    try {
      consola.log("Processing webhook event:", event.event);

      switch (event.event) {
        case "post.published":
        case "post.updated":
          await collectionService.indexPost(collectionId, event.data.post.id);
          break;

        case "post.unpublished":
        case "post.deleted":
          await collectionService.deletePost(collectionId, event.data.post.id);
          break;

        case "page.published":
        case "page.updated":
          // Pages use the same indexPost method since they have the same structure
          await collectionService.indexPost(collectionId, event.data.page.id);
          break;

        case "page.unpublished":
        case "page.deleted":
          // Pages use the same deletePost method
          await collectionService.deletePost(collectionId, event.data.page.id);
          break;

        default:
          consola.warn("Unknown webhook event:", event.event);
      }

      consola.success("Webhook event processed successfully");
    } catch (error: any) {
      consola.error("Failed to process webhook event:", error.message);
      throw new Error(`Failed to process webhook event: ${error.message}`);
    }
  }

  /**
   * Get Ghost site information
   */
  async getSiteInfo(): Promise<any> {
    try {
      // Use settings endpoint as an alternative to site endpoint
      const response = await this.contentClient.settings.fetch();

      if (!response.success) {
        const errors = response.errors || [];
        const errorMessage = errors.map((e: any) => e.message || e).join(", ");
        throw new Error(
          `Failed to get site info: ${errorMessage || "Unknown error"}`,
        );
      }

      return response.data;
    } catch (error: any) {
      consola.error("Failed to get site info:", error.message);
      throw new Error(`Failed to get site info: ${error.message}`);
    }
  }
}

// Export singleton instance for backward compatibility
export const ghostService = new GhostService({
  url: "https://admin.bimflow.app",
  contentApiKey: "270d63026ccd4bf0ee62fcf7d2",
});
