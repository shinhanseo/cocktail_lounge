// src/routes/oauth/index.js
import { Router } from "express";
import google from "../oauth/google.js";
import naver from "../oauth/naver.js";
import kakao from "../oauth/kakao.js";

const router = Router();
router.use("/google", google);
router.use("/naver", naver);
router.use("/kakao", kakao);

export default router;
