// routes/auth.js
import { Router } from "express";
import db from "../db/client.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// 환경 변수 (없으면 임시 값)
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

// 로그인
const LoginSchema = z.object({
  login_id: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  try {
    const { login_id, password } = LoginSchema.parse(req.body);

    // 1) 유저 조회
    const rows = await db.query(
      `SELECT id, login_id, name, password_hash
       FROM users
       WHERE login_id = $1
       LIMIT 1`,
      [login_id]
    );

    if (rows.length === 0) {
      // 존재하지 않는 아이디
      return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = rows[0];

    // 2) 비밀번호 검증
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    // 3) JWT 생성 (7일)
    const payload = { uid: user.id, login_id: user.login_id, name: user.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // 4) HttpOnly 쿠키로 내려줌
    res.cookie("auth", token, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 프런트에서 쓸 최소 정보 응답
    return res.json({ user: { id: user.id, login_id: user.login_id, name: user.name } });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: err.issues[0].message });
    console.error("[POST /api/login] error:", err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 내 정보
router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: req.user }); 
});

// 로그아웃
router.post("/logout", (req, res) => {
  res.clearCookie("auth", { path: "/" });
  return res.json({ ok: true });
});

export default router;
