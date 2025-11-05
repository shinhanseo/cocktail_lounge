import { Router } from "express";
import db from "../db/client.js";
import jwt from "jsonwebtoken";

const router = Router();

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const IS_PROD = process.env.NODE_ENV === "production";

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

// GET /api/comments/:id → 특정 게시글의 댓글 목록
router.get("/:id", async (req, res, next) => {
  try {
    const postId = req.params.id;

    const rows = await db.query(
      `
      SELECT c.id, c.body, u.login_id AS author, c.created_at
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      `,
      [postId]
    );
    if (rows.length === 0) {
      return res.status(200).json({ message: "게시글에 댓글이 없습니다." });
    }
    
    // 변환
    const comments = rows.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.author,
      date: c.created_at
        ? new Date(c.created_at).toISOString().slice(0, 10)
        : null,
    }));

    res.json({ comments });
  } catch (err) {
    next(err);
  }
});


router.post("/", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id; // 로그인한 사용자 정보
    const { postId, body } = req.body; // 프런트에서 넘겨준 게시글 ID와 댓글 내용

    // 유효성 검사
    if (!postId || !body) {
      return res.status(400).json({ error: "postId와 body는 필수입니다." });
    }

    // 댓글 삽입
    const result = await db.query(
      `
      INSERT INTO comments (post_id, user_id, body, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, body, created_at
      `,
      [postId, userId, body]
    );

    const comment = result[0];

    res.status(201).json({
      id: comment.id,
      body: comment.body,
      author: req.user.login_id, // 로그인한 유저 ID
      date: new Date(comment.created_at).toISOString().slice(0, 10),
      message: "댓글이 작성되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const commentId = req.params.id;     // 삭제할 댓글 id
    const userId = req.user.id;       // 로그인한 사용자 id

    // 작성자 본인 댓글인지 확인
    const rows = await db.query(
      `SELECT user_id FROM comments WHERE id = $1`,
      [commentId]
    );
    if (rows.length === 0) 
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    if (rows[0].user_id !== userId)
      return res.status(403).json({ message: "본인만 삭제할 수 있습니다." });

    // 삭제 실행
    await db.query(`DELETE FROM comments WHERE id = $1`, [commentId]);
    res.json({ message: "삭제 완료" });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;      // 로그인한 사용자 id
    const commentId = req.params.id;
    const { body } = req.body;

    // 댓글 존재 + 작성자 확인
    const rows = await db.query(
      "SELECT id, user_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: "본인 댓글만 수정할 수 있습니다." });
    }

    // 수정
    await db.query(
      `
      UPDATE comments
      SET body = $1, updated_at = NOW()
      WHERE id = $2
      `,
      [body, commentId]
    );

    res.status(200).json({ message: "수정 완료" });
  } catch (e) {
    next(e);
  }
});

export default router;