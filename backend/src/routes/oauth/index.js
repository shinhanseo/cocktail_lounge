// src/routes/oauth/index.js
import { Router } from "express";
import google from "../oauth.google.js";
import naver from "../oauth.naver.js";

const router = Router();
router.use("/google", google);
router.use("/naver", naver);

export default router;
