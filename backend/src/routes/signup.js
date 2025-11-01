// src/routes/signup.js
import { Router } from "express";
import db from "../db/client.js";
import bcrypt from "bcrypt";
import { z } from "zod";

// --- 유효성 스키마 (트림 + 정규식 + 길이) ---
const SignUpSchema = z.object({
  login_id: z
    .string()
    .trim()
    .min(4, "아이디는 4~20자여야 합니다.")
    .max(20, "아이디는 4~20자여야 합니다.")
    .regex(/^[a-zA-Z0-9_]+$/, "아이디는 영문/숫자/밑줄만 가능합니다."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    // 프런트와 동일 정책(영문/숫자/특수문자 포함)으로 백엔드도 맞춤
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, "비밀번호는 영문·숫자·특수문자를 포함해야 합니다."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("올바른 이메일 형식이 아닙니다.")
    .optional()
    .or(z.literal("")), // 빈 문자열 허용(원치 않으면 제거)
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력하세요."),
  birthday: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "생년월일은 YYYYMMDD 형식의 8자리 숫자여야 합니다."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "전화번호는 숫자 9~15자리여야 합니다. (- 제외)"),
});

const router = Router();

router.post("/", async (req, res) => {
  try {
    // 1) 파싱/정규화
    const parsed = SignUpSchema.parse(req.body);
    const {
      login_id,
      password,
      name,
      birthday, // YYYYMMDD
      phone,
      email,
    } = parsed;

    // 빈 문자열로 들어온 email은 NULL로 저장 (UNIQUE 파셜 인덱스와 궁합)
    const normEmail = email && email.length > 0 ? email : null;

    // 2) 비밀번호 해시
    const password_hash = await bcrypt.hash(password, 12);

    // 3) INSERT
    const rows = await db.query(
      `
      INSERT INTO users (login_id, password_hash, name, birthday, phone, email)
      VALUES ($1, $2, $3, to_date($4, 'YYYYMMDD'), $5, $6)
      RETURNING id, login_id, name, to_char(birthday, 'YYYY-MM-DD') AS birthday, phone, email, created_at
      `,
      [login_id, password_hash, name, birthday, phone, normEmail]
    );

    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    // 4) Zod 유효성 오류
    if (err instanceof z.ZodError) {
      const message = err.errors?.[0]?.message || "입력값을 확인해 주세요.";
      return res.status(400).json({ message });
    }

    // 5) Postgres UNIQUE 충돌 처리
    if (err?.code === "23505") {
      // constraint 이름은 DB 스키마에 맞게 확인 (예: users_login_id_key, users_phone_key, users_email_key)
      const c = err.constraint || "";
      const msg =
        c.includes("users_login_id_key")
          ? "이미 존재하는 아이디입니다."
          : c.includes("users_phone_key")
          ? "이미 사용 중인 전화번호입니다."
          : c.includes("users_email_key")
          ? "이미 사용 중인 이메일입니다."
          : "중복된 값이 있습니다.";
      return res.status(409).json({ message: msg });
    }

    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
