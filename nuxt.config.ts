// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import type { NuxtConfig } from '@nuxt/schema'
import Aura from '@primeuix/themes/aura';
// Remove invalid import since @primevue/themes doesn't exist
// The Aura theme should be configured differently in PrimeVue

// Add type annotation to ensure proper typing
const config: NuxtConfig = {
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    '@nuxt/image',
    'radix-vue/nuxt',
    '@pinia/nuxt',
    'shadcn-nuxt',
    '@primevue/nuxt-module',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    'pinia-plugin-persistedstate/nuxt',
  ],
  // @ts-ignore - Ignore type checking for primevue config since types aren't properly exposed
  primevue: {
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.primevue-dark',
          cssLayer: {
            name: 'primevue',
            order: 'app-styles, primevue, another-css-library'
          }
        }
      }
    },
    autoImport: true,
  },
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
  piniaPluginPersistedstate: {
    storage: 'localStorage',
    cookieOptions: {
      sameSite: 'lax',
    },
    debug: true,
  },

  compatibilityDate: '2024-11-01',
}

export default defineNuxtConfig(config)
