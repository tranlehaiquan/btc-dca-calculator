import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'
import path from 'path'

const langs = ['en', 'vi', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'ru', 'pt', 'it', 'hi'];
const dynamicRoutes = langs.map(lang => `?lng=${lang}`);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://yourdomain.com', // Replace with your actual domain
      dynamicRoutes,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
