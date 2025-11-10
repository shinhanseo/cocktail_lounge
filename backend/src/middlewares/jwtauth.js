// middlewares/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const IS_PROD = process.env.NODE_ENV === "production";

// 공용: JWT 확인 미들웨어
export function authRequired(req, res, next) {
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

export function optionalAuth(req, _res, next) {
  const token = req.cookies?.auth;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET); // jwt.verify() -> 토근명, 키 
      req.user = payload; 
    } catch {}
  }
  next();
}
