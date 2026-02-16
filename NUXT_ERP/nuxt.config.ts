import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    experimental: {
      openAPI: true
    },
  },
  runtimeConfig: {
    // Variables privadas del servidor (accesibles solo en server/)
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'ERP_',
    sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-key-in-production',
    sessionExpiry: parseInt(process.env.SESSION_EXPIRY || '86400000'), // 24 horas
  },
});