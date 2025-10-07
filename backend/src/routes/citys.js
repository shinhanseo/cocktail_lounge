// backend/src/routes/citys.js
import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

// 목록
router.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.city.findMany({ orderBy: { id: "asc" } });
    // 프론트 기대 스키마 유지: name -> city 로 매핑
    const items = rows.map(c => ({
      id: c.id,
      city: c.name,
      image: c.image ?? null,
    }));
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
