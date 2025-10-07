// backend/src/routes/cocktails.js
import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

// ✅ 전체 칵테일 목록
router.get("/", async (req, res, next) => {
  try {
    const cocktails = await prisma.cocktail.findMany({
      orderBy: { id: "asc" },
    });

    res.json({
      items: cocktails,
      meta: { total: cocktails.length },
    });
  } catch (err) {
    next(err);
  }
});

// ✅ 개별 칵테일 (slug로 조회)
router.get("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const cocktail = await prisma.cocktail.findUnique({
      where: { slug },
    });

    if (!cocktail)
      return res.status(404).json({ message: "Not found" });

    res.json(cocktail);
  } catch (err) {
    next(err);
  }
});

export default router;
