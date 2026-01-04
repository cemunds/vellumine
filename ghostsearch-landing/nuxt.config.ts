// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  mdc: {
    highlight: {
      noApiRoute: false,
    },
  },
  nitro: {
    prerender: {
      routes: ["/"],
    },
  },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/test-utils",
  ],
  runtimeConfig: {
    public: {
      posthogPublicKey: "phc_wJDFwNQ9CC851xP7nxzM7EhIIoMKV1jAXX1FtqU7Hkl",
      posthogHost: "https://eu.i.posthog.com",
      posthogDefaults: "2025-11-30",
    },
  },
  content: {
    experimental: {
      sqliteConnector: "native"
    }
  }
});
