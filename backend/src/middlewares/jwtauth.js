// middlewares/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * 로그인 필수 미들웨어
 * - auth 쿠키에 있는 Access Token을 검증
 * - 만료 또는 없으면 401 반환
 */
export function authRequired(req, res, next) {
  const token = req.cookies?.auth;

  if (!token) {
    return res.status(401).json({ message: "인증이 필요합니다." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, login_id, name }
    next();
  } catch (err) {
    // access token 만료
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "세션이 만료되었습니다. 다시 로그인해주세요." });
    }
    // 잘못된 토큰
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}

/**
 * 선택적 인증 미들웨어
 * - 로그인하지 않아도 접근 가능
 * - 다만 auth 쿠키가 있다면 검증 후 req.user에 payload 저장
 */
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.auth;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (err) {
      // 만료되거나 손상된 토큰이면 무시하고 비로그인으로 처리
      req.user = null;
    }
  }

  next();
}
