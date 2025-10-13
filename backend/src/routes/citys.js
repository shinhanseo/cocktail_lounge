// backend/src/routes/citys.js
import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();


router.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.city.findMany({ orderBy: { id: "asc" } });
    
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
