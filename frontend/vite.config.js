import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/static": "http://localhost:4000",   // ★ 이 줄
    },
  },
  plugins: [react(),tailwindcss(),require('@tailwindcss/typography')],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),   // src 폴더를 @ 로 매핑
    },
  },
})
