// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

// routers
import postsRouter from "./routes/posts.js";
import cocktailsRouter from "./routes/cocktails.js";
import citysRouter from "./routes/citys.js";
import barsRouter from "./routes/bars.js";
import signupRouter from "./routes/signup.js";
import authRouter from "./routes/auth.js";
import oauthRouter from "./routes/oauth/index.js";
import CommentRouter from "./routes/comment.js";
import SearchRouter from "./routes/search.js";
import GemeniRouter from "./routes/gemeni.js";

const app = express();

/* =========================
   0) Sentry init (최상단)
========================= */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: 0.1,
});

/** 1) 기본 미들웨어 */
app.use(express.json());
app.use(cookieParser());

/** 2) CORS */
const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  ...parseOrigins(process.env.FRONTEND_URLS),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/** 3) 헬스체크 */
app.get("/healthz", (_, res) => res.send("ok"));

/** 4) Sentry 테스트 */
app.get("/__sentry_test", () => {
  throw new Error("Backend Sentry test " + Date.now());
});

app.get("/__sentry_message_test", (_, res) => {
  Sentry.captureMessage("Backend Sentry message " + Date.now(), "info");
  res.json({ ok: true });
});

/** 5) 라우터 */
app.use("/api/posts", postsRouter);
app.use("/api/cocktails", cocktailsRouter);
app.use("/api/citys", citysRouter);
app.use("/api/bars", barsRouter);
app.use("/api/signup", signupRouter);
app.use("/api/auth", authRouter);
app.use("/api/oauth", oauthRouter);
app.use("/api/comment", CommentRouter);
app.use("/api/search", SearchRouter);
app.use("/api/gemeni", GemeniRouter);

/** 6) 404 */
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

/* =========================
   ✅ 최신 Sentry Express 에러 핸들러
   ❗️ app.use(...)로 감싸지 말고, app을 인자로 전달해야 함
========================= */
Sentry.setupExpressErrorHandler(app);

/** 7) 최종 에러 핸들러 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

export default app;
