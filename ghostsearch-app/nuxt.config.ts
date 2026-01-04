// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/docs": { redirect: "/docs/getting-started", prerender: false },
  },
  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },
  supabase: { redirect: false },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "nuxt-og-image",
    "@vueuse/nuxt",
  ],
});
