// src/routes/oauth.naver.js
// -------------------------------------------------------------
// 🔐 Naver OAuth2 라우터
// - /oauth/naver            : Naver 동의 화면으로 리다이렉트
// - /oauth/naver/callback   : code 수신 → 토큰 교환 → 구글 프로필 조회
//                            → (users, oauth_accounts) 업서트
//                            → 자체 JWT 발급하여 'auth' 쿠키로 세팅
//                            → 프론트로 리디렉션
// -------------------------------------------------------------

import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import db from "../../db/client.js";

const router = Router();
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const IS_PROD = process.env.NODE_ENV === "production";

const state = "1225";
// -------------------------------------------------------------
// 1) 인가 요청: 동의화면으로 보내기
// -------------------------------------------------------------
router.get("/naver", (req, res) => {
  const api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + NAVER_CLIENT_ID + '&redirect_uri=' + NAVER_REDIRECT_URI + '&state=' + state;
  res.redirect(api_url); 
});

router.get('/naver/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing code");

    // 토큰 교환
    const tokenRes = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      new URLSearchParams({
        grant_type: "authorization_code",     
        client_id: NAVER_CLIENT_ID,            
        client_secret: NAVER_CLIENT_SECRET,   
        redirect_uri: NAVER_REDIRECT_URI,     
        code,                                 
        state,                               
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data || {};
    if (!access_token) return res.status(400).send("No access_token");

    // 사용자 정보
    const { data } = await axios.get("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    // 2) 실제 필드는 data.response 안에 있음
    const n = data?.response ?? {};  // r: { id, email, name, nickname, birthyear, birthday, ... }
    
    // 3) 안전하게 꺼내 쓰기
    const provider = "naver";
    const providerUserId = n.id;
    const email = (n.email ?? null) || null;
    const displayNameBase =
      n.name || n.nickname || (email?.split("@")[0]) || `naver_${(providerUserId || "").slice(0, 6)}`;
    const birthday =
      n.birthyear && n.birthday
        ? `${n.birthyear}${String(n.birthday).replace(/-/g, "")}` // "YYYYMMDD"
        : null;
    const phone = n.mobile;

    let userRow;

    // 간단 업서트
    await db.tx(async ({ query }) => {
      // 기존 계정(연동) 확인
      const acc = await query(
        `SELECT user_id FROM oauth_accounts WHERE provider=$1 AND provider_user_id=$2 LIMIT 1`,
        [provider, providerUserId]
      );

      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

      //기존 네이버로 로그인한 계정이 존재할 경우
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
          `SELECT id, login_id, name FROM users WHERE id=$1`,
          [userId]
        );
        userRow = u[0];
        return;
      }

      // 이메일로 기존 유저 매칭 (없으면 생성)
      let existing = null;
      if (email) {
        const found = await query(
          `SELECT id, login_id, name, email FROM users WHERE email=$1 LIMIT 1`,
          [email]
        );
        existing = found[0] || null;
      }
      
      // 2) 없으면 새 유저 생성 
      if (!existing) {
        let name = displayNameBase;
      
        const inserted = await query(
          `INSERT INTO users (login_id, name, email, phone, birthday)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, login_id, name, email, phone, birthday`,
          [
            email,
            name,
            email,   
            phone, 
            birthday
          ]
        );
        existing = inserted[0];
      }
      
      // 3) oauth_accounts 업서트 동일 (userRow는 existing)
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
    const payload = { id: userRow.id, login_id: userRow.login_id, name: userRow.name };
    const appToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("auth", appToken, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // next/state 없이 홈으로
    return res.redirect(`${FRONTEND_URL}/`);
  } catch (err) {
    console.error("OAuth Error:", err?.response?.data || err?.message || err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;
