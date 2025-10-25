import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db/client.js"; // ⬅️ 추가
import postsRouter from "./routes/posts.js";
import cocktailsRouter from "./routes/cocktails.js";
import citysRouter from "./routes/citys.js";
import barsRouter from "./routes/bars.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/static",
  express.static("C:/Users/imkar/OneDrive/바탕 화면/Project/backend/public")
);

app.get("/healthz", (_, res) => res.send("ok"));
app.use("/api/posts", postsRouter);
app.use("/api/cocktails", cocktailsRouter);
app.use("/api/citys", citysRouter);
app.use("/api/bars", barsRouter);

app.get("/debug/db", async (_, res, next) => {
  try {
    const [{ now }] = await db.query("SELECT now()");
    res.json({ ok: true, now });
  } catch (e) { next(e); }
});

app.get("/debug/env", (_, res) => {
  const url = process.env.DATABASE_URL || "";
  try {
    const u = new URL(url);
    res.json({ ok: true, host: u.hostname, db: u.pathname.replace(/^\//,"") });
  } catch {
    res.json({ ok: false, hasDATABASE_URL: Boolean(url) });
  }
});

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});


export default app;
