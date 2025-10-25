import { Router } from "express";
import db from "../db/client.js";

const router = Router();

/**
 * 목록: 프론트는 limit 안 보냄 → DB 전체(보통 20건 정도면 OK)
 * - slug가 NULL인 경우 id를 slug로 대체해서 응답 (프론트 변경 불필요)
 */
router.get("/", async (req, res, next) => {
  try {
    const items = await db.query(
      `SELECT
         id,
         name,
         COALESCE(slug, id::text) AS slug,   -- ✅ slug 없으면 id로 대체
         abv,
         tags,
         ingredients,
         steps,
         image,
         comment
       FROM cocktails
       ORDER BY id ASC`
    );

    res.json({ items, meta: { total: items.length } });
  } catch (err) {
    console.error("[/api/cocktails] ERROR", err);
    next(err);
  }
});

/**
 * 상세: /api/cocktails/:slug
 * - slug로 먼저 찾고, 없으면 id(문자열)로도 허용 → 프론트 수정 불필요
 */
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    const rows = await db.query(
      `SELECT
         id,
         name,
         COALESCE(slug, id::text) AS slug,
         abv,
         tags,
         ingredients,
         steps,
         image,
         comment
       FROM cocktails
       WHERE slug = $1 OR id::text = $1
       LIMIT 1`,
      [slug]
    );

    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[/api/cocktails/:slug] ERROR", err);
    next(err);
  }
});

export default router;
