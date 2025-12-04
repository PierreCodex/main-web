// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    // Headers de seguridad para todas las rutas
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    // CORS restringido para APIs
    '/api/**': {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://registronegrodeinfieles.vercel.app', 'https://www.registronegrodeinfieles.vercel.app']
          : ['http://localhost:3000'],
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
      }
    }
  },

  supabase: {
    redirect: false
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
