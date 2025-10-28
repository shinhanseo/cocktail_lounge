import { Router } from "express";
import db from "../db/client.js";
import bcrypt from "bcrypt";
import { z } from "zod";

const SignUpSchema = z.object({ // 유효성 검사
  login_id: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  name: z.string().min(1),
  birthday: z.string().regex(/^\d{8}$/), // "YYYYMMDD"
  phone: z.string().min(9).max(20).regex(/^\d+$/),
});

const router = Router();

router.post("/", async(req, res) => {
  try{
    const parsed = SignUpSchema.parse(req.body);
    const {login_id, password, name, birthday, phone} = parsed;
    const password_hash = await bcrypt.hash(password, 12);
    const rows = await db.query(
      `
      INSERT INTO users (login_id, password_hash, name, birthday, phone)
      VALUES ($1, $2, $3, to_date($4, 'YYYYMMDD'), $5)
      RETURNING id, login_id, name, to_char(birthday, 'YYYY-MM-DD') AS birthday, phone, created_at
      `,
      [login_id, password_hash, name, birthday, phone]
    );
    return res.status(201).json({ user: rows[0] }); 
  }
  catch (err) {
    if (err?.code === "23505") {
      const msg =
        err.constraint?.includes("users_login_id_key")
          ? "이미 존재하는 아이디입니다."
          : err.constraint?.includes("users_phone_key")
          ? "이미 사용 중인 전화번호입니다."
          : "중복된 값이 있습니다.";
  
      return res.status(409).json({ message: msg });
    }
  
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }

})

export default router;