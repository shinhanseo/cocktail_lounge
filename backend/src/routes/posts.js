// backend/src/routes/posts.js
import { Router } from "express";
import db from "../db/client.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { authRequired } from "../middlewares/jwtauth.js";
import { optionalAuth } from "../middlewares/jwtauth.js";
const router = Router();

/* ===============================
   유효성 스키마
================================*/
const CreatePostSchema = z.object({
  user_id: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional().default([]),
});

/* ===============================
   GET /posts/latest?limit=5
   최근 글 목록 (최신순)
================================*/
router.get("/latest", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 5);

    const rows = await db.query(
      `SELECT p.id, p.title, u.login_id AS author, p.created_at
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
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
   GET /mypost
   내 게시글 조회
================================*/
router.get("/mypost", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // page 파라미터 받기 (없으면 1)
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);
    const offset = (page - 1) * limit;

    // 전체 개수 조회
    const [{ count }] = await db.query(`SELECT COUNT(*)::int AS count FROM posts WHERE user_id = $1`,[userId]);
    const pageCount = Math.max(Math.ceil(count / limit), 1);

    // 실제 게시글 가져오기
    const rows = await db.query(
      "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      date: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : null,
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

//내 좋아요
router.get("/mylike", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // page 파라미터 받기 (없으면 1)
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);
    const offset = (page - 1) * limit;

    // 전체 개수 조회
    const [{ count }] = await db.query(
      `
      SELECT COUNT(*)::int AS count
      FROM post_likes pl
      JOIN posts p ON p.id = pl.post_id
      WHERE pl.user_id = $1
      `,
      [userId]
    );
    const pageCount = Math.max(Math.ceil(count / limit), 1);

    // 실제 게시글 가져오기
    const rows = await db.query(
      `
      SELECT p.id, p.title, p.created_at, u.login_id AS author, p.like_count
      FROM post_likes pl
      JOIN posts p ON p.id = pl.post_id
      LEFT JOIN users u ON u.id = p.user_id
      WHERE pl.user_id = $1
      ORDER BY pl.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      user: p.author ?? null,
      date: p.created_at
        ? new Date(p.created_at).toISOString().slice(0, 10)
        : null,
      like_count: p.like_count ?? 0,
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
      `SELECT 
        p.id, 
        p.title, 
        u.login_id AS author, 
        p.created_at, 
        p.tags, 
        p.body, 
        COUNT(DISTINCT c.id) + COUNT(DISTINCT s.id) AS comment_count, 
        p.like_count
      FROM posts p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN subcomments s ON s.comment_id = c.id
      GROUP BY p.id, u.login_id
      ORDER BY p.id DESC
      LIMIT $1 OFFSET $2;`,
      [limit, offset]
    );

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      user: p.author ?? null,
      date: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : null,
      tags: p.tags ?? [],
      body: p.body,
      comment_count : p.comment_count,
      like_count : p.like_count,
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
      `SELECT p.id,
              p.title,
              u.login_id AS author,
              p.created_at,
              p.tags,
              p.body,
              p.like_count
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    const post = rows[0];
    if (!post) return res.status(404).json({ message: "Not found" });

    res.json({
      id: post.id,
      title: post.title,
      user: post.author ?? null,
      date: post.created_at
        ? new Date(post.created_at).toISOString().slice(0, 10)
        : null,
      tags: post.tags ?? [],
      body: post.body,
      like_count: post.like_count ?? 0,
    });
  } catch (err) {
    next(err);
  }
});



/* ===============================
   DELETE /posts/:id
   게시글 삭제
================================*/
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;       // 로그인한 사용자 id
    const postId = req.params.id;     // 삭제할 게시글 id

    // 작성자 본인 게시글인지 확인
    const rows = await db.query(
      "SELECT id, user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: "본인 게시글만 삭제할 수 있습니다." });
    }

    // 삭제
    await db.query("DELETE FROM posts WHERE id = $1", [postId]);
    res.json({ message: "삭제 완료" });
  } catch (e) {
    next(e);
  }
});


/* ===============================
   PUT /posts/:id
   게시글 수정
================================*/
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;      // 로그인한 사용자 id
    const postId = req.params.id;    // 수정할 게시글 id
    const { title, body, tags } = req.body;

    // 게시글 존재 + 작성자 확인
    const rows = await db.query(
      "SELECT id, user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: "본인 게시글만 수정할 수 있습니다." });
    }

    // 수정
    await db.query(
      `
      UPDATE posts
      SET title = $1, body = $2, tags = $3, updated_at = NOW()
      WHERE id = $4
      `,
      [title, body, tags, postId]
    );

    res.status(200).json({ message: "수정 완료" });
  } catch (e) {
    next(e);
  }
});


/* ===============================
   post /posts
   게시글 작성
================================*/
router.post("/", authRequired, async (req, res) => {
  try {
    const parsed = CreatePostSchema.parse(req.body);
    const userId = req.user.id;

    const rows = await db.query(
      `
      INSERT INTO posts (user_id, title, body, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, title, body, tags, created_at, updated_at, like_count
      `,
      [userId, parsed.title, parsed.body, parsed.tags]
    );

    return res.status(201).json({ post: rows[0] });
  } catch (err) {
    if (err?.issues) {
      return res.status(400).json({ message: err.issues[0].message });
    }
    if (err?.code === "23503") {
      return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
    }
    console.error("[POST /api/posts] error:", err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//게시글 좋아요
router.post("/:id/like", authRequired, async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.tx(async (t) => {
      // 좋아요 추가 (중복 방지)
      const { rowCount } = await t.raw.query(
        `INSERT INTO post_likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (post_id, user_id) DO NOTHING`,
        [postId, userId]
      );

      // 새로 추가된 경우에만 like_count +1
      if (rowCount > 0) {
        await t.query(
          `UPDATE posts
           SET like_count = COALESCE(like_count, 0) + 1
           WHERE id = $1`,
          [postId]
        );
      }

      // 최신 좋아요 수 반환
      const [{ like_count }] = await t.query(
        `SELECT like_count FROM posts WHERE id=$1`,
        [postId]
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
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.tx(async (t) => {
      const { rowCount } = await t.raw.query(
        `DELETE FROM post_likes
         WHERE post_id=$1 AND user_id=$2`,
        [postId, userId]
      );

      // 삭제된 경우에만 like_count -1
      if (rowCount > 0) {
        await t.query(
          `UPDATE posts
           SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
           WHERE id=$1`,
          [postId]
        );
      }

      const [{ like_count }] = await t.query(
        `SELECT like_count FROM posts WHERE id=$1`,
        [postId]
      );

      return { liked: false, like_count };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 해당 게시글 좋아요 조회
router.get("/:id/like", optionalAuth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id ?? null;

    // 전체 좋아요 수
    const [{ like_count }] = await db.query(
      `SELECT like_count FROM posts WHERE id=$1`,
      [postId]
    );

    // 내가 누른 상태
    let liked = false;
    if (userId) {
      const r = await db.query(
        `SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2 LIMIT 1`,
        [postId, userId]
      );
      liked = r.length > 0;
    }

    res.json({ like_count: like_count ?? 0, liked });
  } catch (err) {
    next(err);
  }
});

export default router;
