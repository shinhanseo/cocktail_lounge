// backend/src/routes/posts.js
import { Router } from "express";
import db from "../db/client.js";

const router = Router();

/* ===============================
   GET /posts/latest?limit=5
   최근 글 목록 (최신순)
================================*/
router.get("/latest", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 5);

    const rows = await db.query(
      `SELECT p.id, p.title, u.nickname AS author, p.created_at
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.id DESC
       LIMIT $1`,
      [limit]
    );

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      user: p.author ?? null,
      createdAt: p.created_at,
    }));

    res.json({ items, meta: { total: items.length } });
  } catch (e) {
    next(e);
  }
});

/* ===============================
   GET /posts?page=1&limit=10
   전체 게시글 (페이지네이션)
================================*/
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);
    const offset = (page - 1) * limit;

    // 전체 개수
    const [{ count }] = await db.query(`SELECT COUNT(*)::int AS count FROM posts`);
    const pageCount = Math.max(Math.ceil(count / limit), 1);

    // 게시글 조회
    const rows = await db.query(
      `SELECT p.id, p.title, u.nickname AS author, p.created_at, p.tags, p.body
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      user: p.author ?? null,
      date: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : null,
      tags: p.tags ?? [],
      body: p.body,
    }));

    res.json({
      items,
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

/* ===============================
   GET /posts/:id
   개별 게시글 조회
================================*/
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const rows = await db.query(
      `SELECT p.id, p.title, u.nickname AS author, p.created_at, p.tags, p.body
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.id = $1`,
      [id]
    );

    const post = rows[0];
    if (!post) return res.status(404).json({ message: "Not found" });

    res.json({
      id: post.id,
      title: post.title,
      user: post.author ?? null,
      date: post.created_at ? new Date(post.created_at).toISOString().slice(0, 10) : null,
      tags: post.tags ?? [],
      body: post.body,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
