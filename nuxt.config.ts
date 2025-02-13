// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    '@nuxt/image',
    'radix-vue/nuxt',
    '@pinia/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  app:{
    head: {
      title: 'BBloom', // Sets the default title
      meta: [
        { charset: 'utf-8' }, // Character encoding
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }, // Responsive design
        { hid: 'description', name: 'description', content: 'A site for booklovers' }, // Meta description
      ],
    },
  },
  ssr:false,
  colorMode: {
    classSuffix: '',
    dataValue: 'theme', // This adds data-theme attribute to <html>
    storageKey: 'bbloom-theme'
  },
  runtimeConfig: {
    // Private keys are only available on the server
    CLOUDFLARE_AUTH_TOKEN: process.env.CLOUDFLARE_AUTH_TOKEN,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACC_ID: process.env.CLOUDFLARE_ACC_ID,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,

    public: {
      imageUrl: process.env.IMAGEKIT_URL_ENDPOINT,
      defaultKey : process.env.GEMINI_API_KEY,
      baseSafeAPI: process.env.BASE_SAFE_API,
      basePriateAPI: process.env.BASE_PIRATE_API,
    }
  },

  compatibilityDate: '2024-11-01',
})
