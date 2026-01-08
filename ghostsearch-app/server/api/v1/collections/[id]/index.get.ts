import { serverSupabaseUser } from "#supabase/server";
import { collectionService } from "~~/server/services/collection";
import { db } from "~~/server/db";
import consola from "consola";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const collectionId = getRouterParam(event, "id");

  if (!collectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Collection ID is required",
    });
  }

  try {
    const collection = await collectionService.getById(
      db,
      user.sub,
      collectionId,
    );

    if (!collection) {
      throw createError({ statusCode: 404, statusMessage: "Not Found" });
    }

    return collection;
  } catch (error) {
    consola.error("Failed to fetch collection:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch collection",
    });
  }
});
