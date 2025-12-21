// src/sentry.js
import * as Sentry from "@sentry/node";

export function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE, // 선택
    tracesSampleRate: 0.1,
  });

  // 순서 중요
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}
