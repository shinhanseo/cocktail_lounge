// backend/src/routes/citys.js
import { Router } from "express";
import db from "../db/client.js";

const router = Router();

// ✅ GET /citys
router.get("/", async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT id, name, image
       FROM cities
       ORDER BY id DESC`
    );

    const items = rows.map(c => ({
      id: c.id,
      city: c.name,
      image: c.image ?? null,
    }));

    res.json({ items, meta: { total: items.length } });
  } catch (err) {
    next(err);
  }
});

export default router;
