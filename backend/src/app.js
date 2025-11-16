import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.js";
import cocktailsRouter from "./routes/cocktails.js";
import citysRouter from "./routes/citys.js";
import barsRouter from "./routes/bars.js";
import signupRouter from "./routes/signup.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import oauthRouter from "./routes/oauth/index.js";
import CommentRouter from "./routes/comment.js";
import SearchRouter from "./routes/search.js";
import GemeniRouter from "./routes/gemeni.js";

const app = express();
app.use(express.json());

app.use(
  "/static",
  express.static("C:/Users/imkar/OneDrive/바탕 화면/Project/backend/public")
);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,               // 쿠키 주고받기 허용
}));

app.use(cookieParser());
app.use(express.json());
app.get("/healthz", (_, res) => res.send("ok"));
app.use("/api/posts", postsRouter);         // 게시글 관련
app.use("/api/cocktails", cocktailsRouter); // 칵테일 관련
app.use("/api/citys", citysRouter);         // 바 관련 도시 네임 9개
app.use("/api/bars", barsRouter);           // 각 도시별 바
app.use("/api/signup", signupRouter);      // 자체 회원가입
app.use("/api/auth", authRouter);          // 로그인
app.use("/api/oauth", oauthRouter);        // naver, gogle, kakao Oauth2.0 관련
app.use("/api/comment", CommentRouter);    // 댓글 관련
app.use("/api/search", SearchRouter);      // 검색
app.use("/api/gemeni", GemeniRouter);      // 제미나이

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});


export default app;
