// src/routes/oauth.kakao.js
// -------------------------------------------------------------
//   Kakao OAuth2 라우터
// - /oauth/kakao            : Kakao 동의 화면으로 리다이렉트
// - /oauth/kakao/callback   : code 수신 → 토큰 교환 → 구글 프로필 조회
//                            → (users, oauth_accounts) 업서트
//                            → 자체 JWT 발급하여 'auth' 쿠키로 세팅
//                            → 프론트로 리디렉션
// -------------------------------------------------------------

import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import db from "../../db/client.js";

dotenv.config();
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const IS_PROD = process.env.NODE_ENV === "production";

const router = Router();

router.get("/", (req, res) => {
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&scope=profile_nickname,account_email`;
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("Missing code");

    // 토큰 교환
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
        ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data || {};
    if (!access_token) return res.status(400).send("No access_token");

    // 사용자 정보
    const { data } = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const provider = "kakao";
    const providerUserId = String(data.id || "");
    const kakaoAccount = data.kakao_account || {};
    const email = kakaoAccount.email || null;
    const nickname = kakaoAccount.profile.nickname;
    let userRow;

    await db.tx(async ({ query }) => 
    {
      // 기존 계정(연동) 확인
      const acc = await query(
        `SELECT user_id FROM oauth_accounts WHERE provider=$1 AND provider_user_id=$2 LIMIT 1`,
        [provider, providerUserId]
      );

      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

      //기존 카카오로 로그인한 계정이 존재할 경우
      if (acc.length) {
        const userId = acc[0].user_id;
        await query(
          `UPDATE oauth_accounts
             SET access_token=$1,
                 refresh_token=COALESCE($2, refresh_token),
                 expires_at=$3,
                 updated_at=now()
           WHERE provider=$4 AND provider_user_id=$5`,
          [access_token, refresh_token || null, expiresAt, provider, providerUserId]
        );

        const u = await query(  // JWT 토큰 생성용 쿼리
          `SELECT id, login_id, name, nickname FROM users WHERE id=$1`,
          [userId]
        );
        userRow = u[0];
        return;
      }

      // 이메일로 기존 유저 매칭 (없으면 생성)
      let existing = null;
      if (email) {
        const found = await query(
          `SELECT id, login_id, name, email, nickname FROM users WHERE email = $1 LIMIT 1`,
          [email]
        );
        existing = found[0] || null;
      }
      
      // 2) 없으면 새 유저 생성 
      if (!existing) {
        let name = nickname;
      
        const inserted = await query(
          `INSERT INTO users (login_id, name, email, nickname)
           VALUES ($1, $2, $3, $4)
           RETURNING id, login_id, name, email, nickname`,
          [
            email,
            name,
            email,
            email,
          ]
        );
        existing = inserted[0];
      }
      
      // 3) oauth_accounts 인서트
      await query(
        `INSERT INTO oauth_accounts
           (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (provider, provider_user_id)
         DO UPDATE SET access_token=EXCLUDED.access_token,
                       refresh_token=COALESCE(EXCLUDED.refresh_token, oauth_accounts.refresh_token),
                       expires_at=EXCLUDED.expires_at,
                       updated_at=now()`,
        [existing.id, provider, providerUserId, access_token, refresh_token || null, expiresAt]
      );
      
      userRow = existing;
    });

    // 앱 JWT 발급 + 쿠키
    const payload = { id: userRow.id, login_id: userRow.login_id, name: userRow.name, nickname : userRow.nickname };
    const appToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("auth", appToken, {
      httpOnly: true, 
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 
      path: "/",
    });

    return res.redirect(`${FRONTEND_URL}/`);
  } catch (err) {
    console.error("Kakao OAuth error:", err?.response?.status, err?.response?.data || err?.message);
    return res.redirect(`${FRONTEND_URL}/login?error=kakao_oauth_failed`);
  }
});

export default router;