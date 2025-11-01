import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import db from "../db/client.js"; // <- 이미 있는 쿼리 헬퍼
dotenv.config();

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const IS_PROD = process.env.NODE_ENV === "production";

router.get("/google", (req, res) => {
  const state = Buffer.from(JSON.stringify({ next: req.query.next || "/" })).toString("base64");
  let url = "https://accounts.google.com/o/oauth2/v2/auth";
  url += `?client_id=${GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`;
  url += `&response_type=code`;
  url += `&scope=${encodeURIComponent("openid email profile")}`;
  url += `&state=${encodeURIComponent(state)}`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    let next = "/";
    if (state) {
      try { next = JSON.parse(Buffer.from(state, "base64").toString())?.next || "/"; }
      catch (_) {}
    }

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in, id_token } = tokenRes.data;
    if (!access_token) return res.status(400).send("No access_token");

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const g = userRes.data; // { id(or sub), email, name, picture, ... }
    const provider = "google";
    const providerUserId = g.id || g.sub;
    const email = g.email || null;
    const displayNameBase = g.name || (email?.split("@")[0]) || `google_${providerUserId?.slice(0,6)}`;

    let userRow;
    await db.tx(async ({ query }) => {
      // 3-1) oauth_accounts로 바로 매칭 (가장 빠른 경로)
      const accRows = await query(
        `SELECT user_id FROM oauth_accounts WHERE provider=$1 AND provider_user_id=$2 LIMIT 1`,
        [provider, providerUserId]
      );

      if (accRows.length > 0) {
        const userId = accRows[0].user_id;

        const expiresAt =
          expires_in ? new Date(Date.now() + expires_in * 1000) : null;

        await query(
          `UPDATE oauth_accounts
             SET access_token=$1,
                 refresh_token=COALESCE($2, refresh_token),
                 expires_at=$3,
                 updated_at=now()
           WHERE provider=$4 AND provider_user_id=$5`,
          [access_token, refresh_token || null, expiresAt, provider, providerUserId]
        );

        const u = await query(
          `SELECT id, login_id, name FROM users WHERE id=$1`,
          [userId]
        );
        userRow = u[0];
        return;
      }

      let existingUser = null;
      if (email) {
        const found = await query(
          `SELECT id, login_id, name FROM users WHERE login_id=$1 LIMIT 1`,
          [email]
        );
        existingUser = found[0] || null;
      }

      if (!existingUser) {
        let nameCandidate = displayNameBase;
        for (let i = 0; i < 3; i++) {
          try {
            const inserted = await query(
              `INSERT INTO users (login_id, name)
               VALUES ($1, $2)
               RETURNING id, login_id, name`,
              [email, nameCandidate]
            );
            existingUser = inserted[0];
            break;
          } catch (e) {
            // name UNIQUE 충돌 시 이름에 랜덤 꼬리표
            if (String(e.message).includes("users_name_key")) {
              nameCandidate = `${displayNameBase}_${Math.floor(Math.random()*1000)}`;
              continue;
            }
            throw e;
          }
        }
      }

      const expiresAt =
        expires_in ? new Date(Date.now() + expires_in * 1000) : null;

      await query(
        `INSERT INTO oauth_accounts
           (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (provider, provider_user_id)
         DO UPDATE SET access_token=EXCLUDED.access_token,
                       refresh_token=COALESCE(EXCLUDED.refresh_token, oauth_accounts.refresh_token),
                       expires_at=EXCLUDED.expires_at,
                       updated_at=now()`,
        [existingUser.id, provider, providerUserId, access_token, refresh_token || null, expiresAt]
      );

      userRow = existingUser;
    });

    const payload = { id: userRow.id, login_id: userRow.login_id, name: userRow.name };
    const appToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("auth", appToken, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect(`${FRONTEND_URL}${next}`);
  } catch (err) {
    console.error("OAuth Error:", err?.response?.data || err?.message || err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;
