import consola from "consola";
import { db } from "~~/server/db";
import { collectionService } from "~~/server/services/collection";

export default defineEventHandler(async (event) => {
  const query = getQuery<{ collectionId: string }>(event);
  const collectionId = query.collectionId;

  if (!collectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Collection ID is required",
    });
  }

  try {
    const collectionConfig = await collectionService.getCollectionConfig(
      db,
      collectionId,
    );

    if (!collectionConfig) {
      throw createError({
        statusCode: 404,
        statusMessage: "Collection config not found",
      });
    }

    // Set CORS headers to allow requests from any domain
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "*",
    });

    return collectionConfig;
  } catch (error) {
    consola.error("Failed to get collection config: ", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get collection config",
    });
  }
});
