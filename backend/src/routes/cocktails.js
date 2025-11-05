import { Router } from "express";
import db from "../db/client.js";
import jwt from "jsonwebtoken";

const router = Router();

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const IS_PROD = process.env.NODE_ENV === "production";

// 공용 jwt 확인 그러나 로그인을 안해도 무방
function optionalAuth(req, _res, next) {
  const token = req.cookies?.auth;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // 반드시 payload에 id가 들어 있어야 함!
    } catch {}
  }
  next();
}

// 공용: JWT 확인 미들웨어
function authRequired(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ message: "인증이 필요합니다." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { uid, login_id, name }
    next();
  } catch {
    return res.status(401).json({ message: "세션이 만료되었거나 유효하지 않습니다." });
  }
}

// 전체 칵테일 목록
router.get("/", async (req, res, next) => {
  try {
    const items = await db.query(
      `SELECT
         id,
         name,
         abv,
         tags,
         ingredients,
         steps,
         image,
         comment
       FROM cocktails
       ORDER BY id DESC`
    );

    res.json({ items, meta: { total: items.length } });
  } catch (err) {
    console.error("[/api/cocktails] ERROR", err);
    next(err);
  }
});

// 상세 (id 기준)
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const rows = await db.query(
      `SELECT
         id,
         name,
         abv,
         tags,
         ingredients,
         steps,
         image,
         comment
       FROM cocktails
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[/api/cocktails/:id] ERROR", err);
    next(err);
  }
});

router.post("/:id/like", authRequired, async (req, res, next) => {
  const cocktailId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.tx(async (t) => {
      // 좋아요 추가 (중복 방지)
      const { rowCount } = await t.raw.query(
        `INSERT INTO cocktail_likes (cocktail_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (cocktail_id, user_id) DO NOTHING`,
        [cocktailId, userId]
      );

      // 새로 추가된 경우에만 like_count +1
      if (rowCount > 0) {
        await t.query(
          `UPDATE cocktails
           SET like_count = COALESCE(like_count, 0) + 1
           WHERE id = $1`,
          [cocktailId]
        );
      }

      // 최신 좋아요 수 반환
      const [{ like_count }] = await t.query(
        `SELECT like_count FROM cocktails WHERE id=$1`,
        [cocktailId]
      );

      return { liked: true, like_count };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

//게시글 좋아요 삭제
router.delete("/:id/like", authRequired, async (req, res, next) => {
  const cocktailId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.tx(async (t) => {
      const { rowCount } = await t.raw.query(
        `DELETE FROM cocktail_likes
         WHERE cocktail_id=$1 AND user_id=$2`,
        [cocktailId, userId]
      );

      // 삭제된 경우에만 like_count -1
      if (rowCount > 0) {
        await t.query(
          `UPDATE cocktails
           SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
           WHERE id=$1`,
          [cocktailId]
        );
      }

      const [{ like_count }] = await t.query(
        `SELECT like_count FROM cocktails WHERE id=$1`,
        [cocktailId]
      );

      return { liked: false, like_count };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});


router.get("/:id/like", optionalAuth, async (req, res, next) => {
  try {
    const cocktailId = req.params.id;
    const userId = req.user?.id ?? null;

    // 전체 좋아요 수
    const [{ like_count }] = await db.query(
      `SELECT like_count FROM cocktails WHERE id=$1`,
      [cocktailId]
    );

    // 내가 누른 상태
    let liked = false;
    if (userId) {
      const r = await db.query(
        `SELECT 1 FROM cocktail_likes WHERE cocktail_id=$1 AND user_id=$2 LIMIT 1`,
        [cocktailId, userId]
      );
      liked = r.length > 0;
    }

    res.json({ like_count: like_count ?? 0, liked });
  } catch (err) {
    next(err);
  }
});

export default router;
