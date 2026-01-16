import { serverSupabaseUser } from "#supabase/server";
import { collectionService } from "~~/server/services/collection";
import { db } from "~~/server/db";
import consola from "consola";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    const collections = await collectionService.getUserCollections(
      db,
      user.sub,
    );

    return collections;
  } catch (error) {
    consola.error("Failed to fetch collections:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch collections",
    });
  }
});
