// backend/src/routes/posts.js
import { Router } from "express";
import db from "../db/client.js";
import { z } from "zod";

const router = Router();

/* ===============================
   유효성 스키마
================================*/
const CreatePostSchema = z.object({
  // 세션에서 user_id를 읽는 게 정석이지만, 임시로 body.user_id도 허용
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
      `SELECT p.id, p.title, u.login_id AS author, p.created_at, p.tags, p.body
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
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
      `SELECT p.id, p.title, u.login_id AS author, p.created_at, p.tags, p.body
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
      date: post.created_at ? new Date(post.created_at).toISOString().slice(0, 10) : null,
      tags: post.tags ?? [],
      body: post.body,
    });
  } catch (err) {
    next(err);
  }
});


/* ===============================
   delete /posts/:id
   게시글 삭제제
================================*/
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // 존재 확인
    const rows = await db.query("SELECT id FROM posts WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    // 삭제 + 결과 반환
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ message: "삭제 완료"});
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async(req, res, next) => {
  try{
    const {id} = req.params;    
    const {title, body, tags} = req.body;
    const rows = await db.query("SELECT id FROM posts WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    await db.query(`
      UPDATE posts
      SET title=$1, body=$2, tags=$3, updated_at=NOW()
      WHERE id = $4  
    `, [title, body, tags, id]);

    res.status(200).json({message:"수정 완료"});

  }catch(err){
    next(e);
  }
})
/* ===============================
   post /posts
   게시글 작성
================================*/
router.post("/", async (req, res) => {
  try {
    const parsed = CreatePostSchema.parse(req.body);
    const userId = req.user?.id ?? parsed.user_id;
    if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

    const rows = await db.query(
      `
      INSERT INTO posts (user_id, title, body, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, title, body, tags, created_at, updated_at, "like"
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

export default router;
