import { Router } from "express";
import db from "../db/client.js";
import { z } from "zod";

const SignUpSchema = z.object({
  login_id: z.string().min(4).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  name: z.string().min(1),
  birthday: z.string().regex(/^\d{8}$/), // "YYYYMMDD"
  phone: z.string().min(9).max(20).regex(/^\d+$/),
});

const router = Router();

router.post("/singup", async(req, res) => {
  try{

  }
  catch(e){

  }
})