import { Router } from "express";
import db from "../db/client.js";
import jwt from "jsonwebtoken";
import { authRequired } from "../middlewares/jwtauth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

router.get("/mycomment", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);
    const offset = (page - 1) * limit;

    // 댓글 + 대댓글을 UNION ALL로 합쳐서 가져오기
    const [{ count }] = await db.query(
      `
      WITH combined AS (
        SELECT id FROM comments WHERE user_id = $1
        UNION ALL
        SELECT id FROM subcomments WHERE user_id = $1
      )
      SELECT COUNT(*)::int AS count FROM combined
      `,
      [userId]
    );
    const pageCount = Math.max(Math.ceil(count / limit), 1);

    const rows = await db.query(
      `
      WITH combined AS (
        SELECT id, post_id, body, created_at, 'comment' AS type
        FROM comments
        WHERE user_id = $1

        UNION ALL

        SELECT id, post_id, body, created_at, 'subcomment' AS type
        FROM subcomments
        WHERE user_id = $1
      )
      SELECT c.*, p.title
      FROM combined c
      JOIN posts p ON p.id = c.post_id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3;
      `,
      [userId, limit, offset]
    );
    

    if (rows.length === 0) {
      return res.status(200).json({ message: "작성한 댓글이 없습니다." });
    }

    const items = rows.map((c) => ({
      id: c.id,
      postId: c.post_id,
      body: c.body,
      type: c.type, // comment / subcomment 구분
      title : c.title,
      date: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : null,
    }));

    res.status(200).json({
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

// 댓글 조회 (특정 게시글)
router.get("/:id", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const rows = await db.query(
      `SELECT c.id, c.body, u.login_id AS author, c.created_at
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );
    const comments = rows.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.author,
      date: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : null,
    }));
    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

// 댓글 작성
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { postId, body } = req.body;
    if (!postId || !body) return res.status(400).json({ message: "필수값 누락" });

    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, body, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, body, created_at`,
      [postId, req.user.id, body.trim()]
    );
    const comment = result[0];
    res.status(201).json({
      id: comment.id,
      body: comment.body,
      author: req.user.login_id,
      date: new Date(comment.created_at).toISOString().slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
});

// 댓글 수정
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { body } = req.body;
    const commentId = req.params.id;

    const rows = await db.query("SELECT user_id FROM comments WHERE id = $1", [commentId]);
    if (!rows.length) return res.status(404).json({ message: "댓글 없음" });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: "권한 없음" });

    await db.query(
      `UPDATE comments SET body=$1, updated_at=NOW() WHERE id=$2`,
      [body.trim(), commentId]
    );
    res.json({ message: "수정 완료" });
  } catch (err) {
    next(err);
  }
});

// 댓글 삭제
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const rows = await db.query("SELECT user_id FROM comments WHERE id=$1", [commentId]);
    if (!rows.length) return res.status(404).json({ message: "댓글 없음" });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: "권한 없음" });

    await db.query("DELETE FROM comments WHERE id=$1", [commentId]);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    next(err);
  }
});

// --- 대댓글 CRUD ---

// 특정 댓글의 대댓글 조회
router.get("/subcomment/:commentId", async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const rows = await db.query(
      `SELECT s.id, s.body, u.login_id AS author, s.created_at
       FROM subcomments s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.comment_id=$1
       ORDER BY s.created_at ASC`,
      [commentId]
    );
    const subcomments = rows.map((s) => ({
      id: s.id,
      body: s.body,
      author: s.author,
      date: s.created_at ? new Date(s.created_at).toISOString().slice(0, 10) : null,
    }));
    res.json({ subcomments });
  } catch (err) {
    next(err);
  }
});

// 대댓글 작성
router.post("/subcomment", authRequired, async (req, res, next) => {
  try {
    const { postId, commentId, body } = req.body;
    if (!postId || !commentId || !body) return res.status(400).json({ message: "필수값 누락" });

    const result = await db.query(
      `INSERT INTO subcomments (post_id, comment_id, user_id, body, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, body, created_at`,
      [postId, commentId, req.user.id, body.trim()]
    );
    const sub = result[0];
    res.status(201).json({
      id: sub.id,
      body: sub.body,
      author: req.user.login_id,
      commentId,
      date: new Date(sub.created_at).toISOString().slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
});

// 대댓글 수정
router.put("/subcomment/:id", authRequired, async (req, res, next) => {
  try {
    const subId = req.params.id;
    const { body } = req.body;

    const rows = await db.query("SELECT user_id FROM subcomments WHERE id=$1", [subId]);
    if (!rows.length) return res.status(404).json({ message: "대댓글 없음" });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: "권한 없음" });

    await db.query("UPDATE subcomments SET body=$1, updated_at=NOW() WHERE id=$2", [body.trim(), subId]);
    res.json({ message: "수정 완료" });
  } catch (err) {
    next(err);
  }
});

// 대댓글 삭제
router.delete("/subcomment/:id", authRequired, async (req, res, next) => {
  try {
    const subId = req.params.id;
    const rows = await db.query("SELECT user_id FROM subcomments WHERE id=$1", [subId]);
    if (!rows.length) return res.status(404).json({ message: "대댓글 없음" });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: "권한 없음" });

    await db.query("DELETE FROM subcomments WHERE id=$1", [subId]);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;
