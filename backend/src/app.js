import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import postsRouter from "./routes/posts.js";
import cocktailsRouter from "./routes/cocktails.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 절대경로 지정 (OneDrive 경로 꼬임 방지)
app.use(
  "/static",
  express.static("C:/Users/imkar/OneDrive/바탕 화면/Project/backend/public")
);

app.get("/healthz", (_, res) => res.send("ok"));
app.use("/api/posts", postsRouter);
app.use("/api/cocktails", cocktailsRouter);

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});

export default app;
