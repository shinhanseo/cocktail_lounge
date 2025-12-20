import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// ✅ ESM(mjs)에서는 __dirname이 없어서 이렇게 만들어줌
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,      // 프론트 프로젝트 slug
      authToken: process.env.SENTRY_AUTH_TOKEN, // Sentry 토큰 (비밀)
      release: process.env.VITE_APP_RELEASE,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: true,
  },
});
