// src/routes/bars.js
import { Router } from 'express';
import db from '../db/client.js';
import { authRequired, optionalAuth } from '../middlewares/jwtauth.js';

const router = Router();

// GET /bars/hot?limit=4
router.get('/hot', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 4);

    const rows = await db.query(
      `SELECT 
        b.name, 
        c.name AS city, 
        b.comment, 
        COUNT(m.bar_id) AS total_bookmark
      FROM bar_bookmarks m
      JOIN bars b ON b.id = m.bar_id
      JOIN cities c ON c.id = b.city_id
      GROUP BY b.name, c.name, b.comment
      ORDER BY total_bookmark DESC
       LIMIT $1`,
      [limit]
    );

    const items = rows.map(b => ({
      id: b.id,
      name: b.name,
      desc: b.comment ?? null,
      city: b.city ?? null,
    }));

    res.json({ items, meta: { total: items.length } });
  } catch (e) {
    next(e);
  }
});

// src/routes/bars.js
router.get("/mybars", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 쿼리스트링에서 page, limit 추출 (기본값 설정)
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "6", 10), 1);
    const offset = (page - 1) * limit;

    // 전체 개수 조회
    const [{ count }] = await db.query(
      `SELECT COUNT(*)::int AS count FROM bar_bookmarks WHERE user_id = $1`,
      [userId]
    );

    // 실제 데이터 조회 (6개씩)
    const rows = await db.query(
      `
      SELECT
        m.id            AS bookmark_id,
        m.created_at    AS bookmarked_at,
        b.id            AS bar_id,
        b.name          AS bar_name,
        b.comment       AS bar_comment,
        c.name          AS city
      FROM bar_bookmarks m
      JOIN bars   b ON b.id = m.bar_id
      JOIN cities c ON c.id = b.city_id
      WHERE m.user_id = $1
      ORDER BY b.name ASC NULLS LAST, m.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    // 응답
    res.json({
      items: rows.map(r => ({
        bookmark_id: r.bookmark_id,
        bookmarked_at: r.bookmarked_at,
        bar: {
          id: r.bar_id,
          name: r.bar_name,
          desc: r.bar_comment ?? null,
          city: r.city,
        },
      })),
      meta: {
        total: count, // 전체 북마크 개수
        page,
        limit,
        pageCount: Math.max(Math.ceil(count / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
});


//북마크
router.post("/:id/bookmark", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const barId = Number(req.params.id);
    await db.query(
      `INSERT INTO bar_bookmarks (user_id, bar_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, bar_id) DO NOTHING`,
      [userId, barId]
    );
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

// 북마크 제거
router.delete("/:id/bookmark", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const barId = Number(req.params.id);
    await db.query(
      `DELETE FROM bar_bookmarks WHERE user_id = $1 AND bar_id = $2`,
      [userId, barId]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// 북마크 확인
router.get("/:id/bookmark", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id ?? null;
    const barId = Number(req.params.id);
    if (!barId) return res.status(400).json({ message: "Invalid bar id" });

    // 전체 북마크 개수 조회
    const [{ count: totalBookmark }] = await db.query(
      `SELECT COUNT(*)::int AS count FROM bar_bookmarks WHERE bar_id = $1`,
      [barId]
    );

    // 로그인된 유저의 북마크 여부 확인
    let bookmarked = false;
    if (userId) {
      const rows = await db.query(
        `SELECT 1 FROM bar_bookmarks WHERE user_id = $1 AND bar_id = $2 LIMIT 1`,
        [userId, barId]
      );
      bookmarked = rows.length > 0;
    }

    // 응답
    res.json({
      total_bookmark: totalBookmark ?? 0,
      bookmarked,
    });
  } catch (err) {
    next(err);
  }
});


// GET /bars/:city  (예: /bars/서울)
router.get('/:city', async (req, res, next) => {
  try {
    const cityName = req.params.city;

    const cityRows = await db.query(
      `SELECT id, name FROM cities WHERE name = $1`,
      [cityName]
    );
    const city = cityRows[0];
    if (!city) return res.status(404).json({ message: '도시를 찾을 수 없습니다.' });

    const bars = await db.query(
      `
      SELECT 
        b.id, b.name, b.lat, b.lng, b.address, b.phone, b.website, b.comment,
        COUNT(m.bar_id)::int AS total_bookmark
      FROM bars b
      LEFT JOIN bar_bookmarks m ON m.bar_id = b.id
      WHERE b.city_id = $1
      GROUP BY b.id, b.name, b.lat, b.lng, b.address, b.phone, b.website, b.comment
      ORDER BY b.id ASC;
      `,
      [city.id]
    );

    if (bars.length === 0)
      return res.status(404).json({ message: '해당 도시의 바가 없습니다.' });

    res.json({
      items: bars.map(b => ({
        id: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        city: cityName,
        address: b.address,
        phone: b.phone,
        website: b.website,
        desc: b.comment ?? null,
        total_bookmark : b.total_bookmark,
      })),
      meta: { total: bars.length },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
