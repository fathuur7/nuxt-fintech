// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-30',
  devtools: { enabled: true },
  
  // SSR Configuration
  ssr: true,
  
  // Head configuration for CSP
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self';"
        }
      ]
    }
  },
  
  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Runtime configuration
  runtimeConfig: {
    // Supabase configuration
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Payment Gateway Config
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    
    public: {
      // Client-side accessible
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      appDomain: 'http://localhost:3000'
    }
  },

  plugins: [
    { src: '~/plugins/vue-toast-notification.client.ts', mode: 'client' }
  ],

  // Route rules
  routeRules: {
    '/admin/**': { 
      prerender: false,
      headers: { 'X-Frame-Options': 'DENY' }
    },
    '/dashboard/**': { 
      prerender: false 
    },
    '/auth/callback': {
      prerender: false
    }
  },

  // CSS framework
  modules: ['@nuxtjs/tailwindcss'],
  css: ['vue-toast-notification/dist/theme-sugar.css'],

  // SSR configuration for better Supabase integration
  ssr: true
})