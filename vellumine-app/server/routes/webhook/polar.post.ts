export default defineEventHandler((event) => {
  const webhooksHandler = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
      // Handle the payload
      // No need to return an acknowledge response
      console.log(payload);
    },
  });

  return webhooksHandler(event);
});
