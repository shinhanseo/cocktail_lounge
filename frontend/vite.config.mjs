import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/static": "http://localhost:4000",
    },
  },
  plugins: [
    react(),
    tailwindcss() // ✅ 여기까지만 (typography 제거)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
