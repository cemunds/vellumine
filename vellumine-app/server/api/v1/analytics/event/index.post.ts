import consola from "consola";
import { db } from "~~/server/db";
import { collectionService } from "~~/server/services/collection";
import { z } from "zod";

const AnalyticsEvent = z.object({
  collectionId: z.uuid(),
  query: z.string().nonempty(),
  numResults: z.number(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  const analyticsEvent = AnalyticsEvent.safeParse(JSON.parse(body));

  if (!analyticsEvent.success) {
    console.log(analyticsEvent.error);
    throw createError({ statusCode: 400, statusMessage: "Bad request" });
  }

  const userAgent = getHeader(event, "user-agent") ?? "";
  const ipAddress = getHeader(event, "x-forwarded-for") ?? "";

  try {
    const eventId = await collectionService.trackSearchEvent(db, {
      ...analyticsEvent.data,
      userAgent,
      ipAddress,
    });

    // Set CORS headers to allow requests from any domain
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    return eventId;
  } catch (error) {
    consola.error("Failed to get collection config: ", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get collection config",
    });
  }
});
