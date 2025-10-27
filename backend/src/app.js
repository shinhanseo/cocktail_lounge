import express from "express";
import cors from "cors";
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

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});


export default app;
