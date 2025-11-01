// backend/src/routes/oauth.google.js
import { Router } from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

router.get("/google", (req, res) => {
  let url = 'https://accounts.google.com/o/oauth2/v2/auth';
  url += `?client_id=${GOOGLE_CLIENT_ID}`
  url += `&redirect_uri=${GOOGLE_REDIRECT_URI}`
  url += '&response_type=code'
  url += '&scope=openid email profile'    
	res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    //const code = req.query.code;
    const { code, state } = req.query;
    let next = "/"; // 기본 리다이렉트 목적지
    if (state) {
      try {
        next = JSON.parse(Buffer.from(state, "base64").toString())?.next || "/";
      } catch (_) {}
    }
    
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });
    const g = userRes.data;
    const payload = {
      sub: g.id || g.sub,
      email: g.email,
      name: g.name,
      provider: "google",
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    
    const IS_PROD = process.env.NODE_ENV === "production";
    res.cookie("auth", token, {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    
    const FRONT = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${FRONT}`);
    
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err.message);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;
