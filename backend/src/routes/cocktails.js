import { Router } from "express";
import db from "../db/client.js";
import { authRequired } from "../middlewares/jwtauth.js";
import { optionalAuth } from "../middlewares/jwtauth.js";

const router = Router();

// 전체 칵테일 목록
// 전체 칵테일 목록
router.get("/", async (req, res, next) => {
  try {
    // 정렬 기준 쿼리: latest / likes / abv
    const sort = req.query.sort || "latest";

    let orderBy = "id DESC"; // 기본: 최신순 (id 역순)

    if (sort === "likes") {
      // 좋아요 많은 순 → 동점이면 id 역순
      orderBy = "like_count DESC NULLS LAST, id DESC";
    } else if (sort === "abv") {
      // 도수 높은 순 → 동점이면 id 역순
      orderBy = "abv DESC NULLS LAST, id DESC";
    }

    // 🔹 쿼리스트링에서 base/taste 필터 받기
    // 예: /api/cocktails?bases=진,럼&tastes=달콤한,상큼한
    const bases = (req.query.bases || "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0); // ["진", "럼"]

    const tastes = (req.query.tastes || "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0); // ["달콤한", "상큼한"]

    // 🔹 WHERE 절 동적으로 만들기
    const where = [];
    const params = [];
    let idx = 1;

    // tags 컬럼이 VARCHAR[] 라고 가정
    if (bases.length > 0) {
      // tags 배열과 bases 배열이 "하나라도 겹치면" true
      // ex) tags = ['진','상큼한'] / bases = ['진','럼'] → true
      where.push(`tags && $${idx}::varchar[]`);
      params.push(bases);
      idx++;
    }

    if (tastes.length > 0) {
      // 마찬가지로 맛 태그도 하나 이상 겹치는지 검사
      where.push(`tags && $${idx}::varchar[]`);
      params.push(tastes);
      idx++;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await db.query(
      `
      SELECT
        id,
        name,
        image,
        abv,
        comment,
        like_count,
        tags
      FROM cocktails
      ${whereClause}
      ORDER BY ${orderBy}
      `,
      params
    );

    res.json({
      items: rows,
      meta: {
        total: rows.length,
        sort,
        bases,
        tastes,
      },
    });
  } catch (err) {
    console.error("[GET /api/cocktails] ERROR", err);
    next(err);
  }
});


router.get("/mylike", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page  = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "6", 10), 1); // 기본 6
    const offset = (page - 1) * limit;

    // 총 개수
    const [{ count }] = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM cocktail_likes
       WHERE user_id = $1`,
      [userId]
    );
    const pageCount = Math.max(Math.ceil(count / limit), 1);

    // 목록
    const rows = await db.query(
      `SELECT
         c.id,
         c.name,
         c.image,
         c.like_count,
         cl.created_at AS liked_at
       FROM cocktail_likes cl
       JOIN cocktails c ON c.id = cl.cocktail_id
       WHERE cl.user_id = $1
       ORDER BY cl.created_at DESC, c.id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      items: rows.map(r => ({
        id: r.id,
        name: r.name,
        image: r.image,
        like_count: r.like_count ?? 0,
        liked_at: r.liked_at,
      })),
      meta: {
        total: count,
        page,
        limit,
        pageCount,
        hasPrev: page > 1,
        hasNext: page < pageCount,
      },
    });
  } catch (err) {
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

//좋아요 추가
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

//좋아요 삭제
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

// 좋아요 조회
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
