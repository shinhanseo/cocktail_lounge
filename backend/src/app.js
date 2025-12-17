import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

/** 1) 기본 미들웨어 */
app.use(express.json());
app.use(cookieParser());

/**
 * 2) CORS (라우터보다 먼저!)
 * - 로컬 개발: http://localhost:5173
 * - 배포 프런트: process.env.FRONTEND_URL (예: https://xxxx.vercel.app)
 */
const ALLOWED_ORIGINS = new Set(
  [
    "http://localhost:5173",
    process.env.FRONTEND_URL, // 배포 프런트 주소가 있으면 여기에 들어감
  ].filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    // 서버-서버, curl 등 Origin 없는 요청은 허용
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);

    // CORS 디버깅용: 어떤 origin이 막혔는지 서버 로그로 남김
    console.warn("[CORS BLOCKED]", origin, "allowed:", [...ALLOWED_ORIGINS]);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Preflight 요청은 여기서 바로 종료(중요)
app.options(/.*/, cors(corsOptions));

/** 3) 정적 파일 */
app.use(
  "/static",
  express.static("C:/Users/imkar/OneDrive/바탕 화면/Project/backend/public")
  // ✅ 배포용 권장: express.static("public")
);

/** 4) 헬스체크 */
app.get("/healthz", (_, res) => res.send("ok"));

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

/** 7) 에러 핸들러 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

export default app;
