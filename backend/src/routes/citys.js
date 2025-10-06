// backend/src/routes/citys.js
import { Router } from "express";
import { citys } from "../data/citys.js";

const router = Router();

// 목록
router.get("/", (req, res) => {
  res.json({ items: citys }); // 프론트 기대 스키마 유지
});


export default router;
