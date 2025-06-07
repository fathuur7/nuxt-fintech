// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-30',
  devtools: { enabled: true },
  
  // SSR Configuration
  ssr: true,
  
  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Runtime configuration
  runtimeConfig: {
    // admin
    arrayEmailAdmin: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [''],

    // Server-side environment variables
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    dbUrl: process.env.DATABASE_URL,

    mongoUri: process.env.MONGODB_URI,
    
    // Google OAuth Config
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,

    
    // Payment Gateway Config
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    xenditSecretKey: process.env.XENDIT_SECRET_KEY,
    
    // Multi-domain config
    domains: {
      main: process.env.MAIN_DOMAIN || 'fintech.local',
      admin: process.env.ADMIN_DOMAIN || 'admin.fintech.local',
      api: process.env.API_DOMAIN || 'api.fintech.local'
    },

    public: {
      // Client-side accessible
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      appDomain: 'localhost:3000',
      adminDomain: 'localhost:3001',
      mainDomain: 'localhost:3000'
    }
  },

  plugins: [
    // '~/server/plugins/socket.ts' ,
    { src: '~/plugins/socket.client.ts', mode: 'client' }, // '~/plugins/socket.client.ts' 
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
    '/api/**': { 
      cors: true,
      headers: { 'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE' }
    }
  },

  // CSS framework
  // css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],

  // Build configuration
  build: {
    transpile: ['socket.io-client']
  }
})