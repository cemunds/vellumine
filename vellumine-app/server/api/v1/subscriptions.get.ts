import { serverSupabaseUser } from "#supabase/server";
import { Polar } from "@polar-sh/sdk";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: process.env.POLAR_SERVER as "sandbox" | "production",
  });

  const subscriptions = await polar.subscriptions.list({
    externalCustomerId: user.sub,
    active: true,
  });
  const activeSubscription = subscriptions.result.items.pop();

  if (!activeSubscription) {
    return null;
  }

  return activeSubscription;
});
