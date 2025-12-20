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

    // ✅ 빌드 시: 릴리즈 생성 + 소스맵 업로드
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,      // 프론트 프로젝트 slug
      authToken: process.env.SENTRY_AUTH_TOKEN, // Sentry 토큰 (비밀)

      // 릴리즈를 프론트/백엔드 동일하게 맞추면 추적이 쉬움
      release: process.env.VITE_APP_RELEASE,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ 소스맵 켜야 Sentry에서 원본 코드 라인으로 매핑됨
  build: {
    sourcemap: true,
  },
});
