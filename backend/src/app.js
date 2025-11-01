import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.js";
import cocktailsRouter from "./routes/cocktails.js";
import citysRouter from "./routes/citys.js";
import barsRouter from "./routes/bars.js";
import signupRouter from "./routes/signup.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import oauthGoogleRouter from "./routes/oauth.google.js";

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
app.use("/api/posts", postsRouter);
app.use("/api/cocktails", cocktailsRouter);
app.use("/api/citys", citysRouter);
app.use("/api/bars", barsRouter);
app.use("/api/signup", signupRouter);
app.use("/api", authRouter); 
app.use("/api/oauth", oauthGoogleRouter);

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});


export default app;
