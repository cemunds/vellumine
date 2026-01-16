import { serverSupabaseUser } from "#supabase/server";
import { db } from "~~/server/db";
import consola from "consola";
import { collectionService } from "~~/server/services/collection";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const query = getQuery<{ collectionId: string }>(event);
  const collectionId = query.collectionId;

  if (!collectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Collection ID is required",
    });
  }

  try {
    // Verify collection exists and belongs to user
    const collection = await collectionService.getById(
      db,
      user.sub,
      collectionId,
    );

    if (!collection) {
      throw createError({
        statusCode: 404,
        statusMessage: "Collection not found",
      });
    }

    // Get latest sync history
    const latestSync =
      (await collectionService.getSyncHistory(db, collectionId, 1)).at(0) ??
      null;

    // Calculate progress if sync is in progress
    let progress = null;
    if (
      collection.syncStatus === "syncing" &&
      latestSync?.status === "started"
    ) {
      // In a real implementation, you would track progress in real-time
      // For now, we'll return a placeholder progress
      progress = {
        posts: {
          total: collection.postCount || 0,
          processed: latestSync.postsProcessed || 0,
          success: latestSync.postsSuccess || 0,
          failed: latestSync.postsFailed || 0,
        },
        pages: {
          total: collection.pageCount || 0,
          processed: latestSync.pagesProcessed || 0,
          success: latestSync.pagesSuccess || 0,
          failed: latestSync.pagesFailed || 0,
        },
      };
    }

    return {
      status: collection.syncStatus,
      progress: progress,
      startedAt: latestSync?.startedAt || null,
      completedAt: latestSync?.completedAt || null,
      error: collection.syncError || null,
      lastSyncAt: collection.lastSyncAt || null,
      postCount: collection.postCount || 0,
      pageCount: collection.pageCount || 0,
    };
  } catch (error) {
    consola.error("Failed to get sync status:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get sync status",
    });
  }
});
