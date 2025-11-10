// routes/auth.js
import { Router } from "express";
import db from "../db/client.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRequired } from "../middlewares/jwtauth.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const IS_PROD = process.env.NODE_ENV === "production";
const router = Router();

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
      return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = rows[0];

    // 2) 비밀번호 검증
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    // 3) Access + Refresh Token 발급
    const payload = { id: user.id, login_id: user.login_id, name: user.name };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }); // 15분
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // 7일

    // DB에 refresh 저장
    await db.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [refreshToken, user.id]);

    // 쿠키 설정
    //access token 쿠키
    res.cookie("auth", accessToken, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 15 * 60 * 1000, // 15분
      path: "/",
    });
    //refresh token 쿠키
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: "/",
    });

    //프런트에 응답
    return res.json({ user: { id: user.id, login_id: user.login_id, name: user.name } });
  } catch (err) {
    console.error("[POST /api/login] error:", err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 내 정보
router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: req.user }); 
});

//access token 재생성
router.post("/refresh", async (req, res) => {
  const refresh = req.cookies?.refresh;
  if (!refresh) return res.status(401).json({ message: "리프레시 토큰이 없습니다." });

  try {
    const payload = jwt.verify(refresh, JWT_SECRET);
    const rows = await db.query(
      `SELECT id, login_id, name, refresh_token FROM users WHERE id = $1`,
      [payload.id]
    );

    const user = rows[0];
    if (!user || user.refresh_token !== refresh) {
      return res.status(401).json({ message: "리프레시 토큰이 유효하지 않습니다." });
    }

    // 새 Access Token 발급
    const newAccess = jwt.sign(
      { id: user.id, login_id: user.login_id, name: user.name },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("auth", newAccess, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("refresh error:", e);
    return res.status(401).json({ message: "토큰 재발급 실패" });
  }
});

// 로그아웃
router.post("/logout", async (req, res) => {
  const refresh = req.cookies?.refresh;
  if (refresh) {
    try {
      const payload = jwt.verify(refresh, JWT_SECRET);
      await db.query(`UPDATE users SET refresh_token = NULL WHERE id = $1`, [payload.id]);
    } catch {}
  }

  res.clearCookie("auth", { path: "/" });
  res.clearCookie("refresh", { path: "/" });
  return res.json({ ok: true });
});

export default router;
