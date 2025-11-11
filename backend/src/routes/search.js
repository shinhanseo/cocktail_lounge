import { Router } from "express";
import db from "../db/client.js";

const router = Router();

router.get("/posts", async(req, res, next) => {
  try {
    const keyword = (req.query.keyword || "").toString().trim()
    // page 파라미터 받기 (없으면 1)
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);
    const offset = (page - 1) * limit;

    // 전체 개수 조회
    const [{ count }] = await db.query(`
      SELECT COUNT(*)::int AS count 
      FROM posts 
      WHERE title ILIKE '%' || $1 || '%'     
            OR body ILIKE '%' || $1 || '%' 
            OR $1 = ANY(tags)`,[keyword]);

    const pageCount = Math.max(Math.ceil(count / limit), 1);

    // 실제 게시글 가져오기
    const rows = await db.query(
      `SELECT p.id, u.login_id, p.title, p.body, p.created_at, p.tags
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE title ILIKE '%' || $1 || '%'     
            OR body ILIKE '%' || $1 || '%' 
            OR $1 = ANY(tags) 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [keyword, limit, offset]
    );

    const items = rows.map(p => ({
      id: p.id,
      login_id : p.login_id,
      title: p.title,
      body : p.body,
      tags: p.tags ?? [],
      date: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : null,
    }));

    res.json({
      items,
      meta: {
        total: count,
        page,
        limit,
        pageCount,
        hasPrev: page > 1,
        hasNext: page < pageCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/cocktails", async (req, res, next) => {
  try{
    const keyword = (req.query.keyword || "").toString().trim()
    const rows = await db.query(
      `SELECT id, name, image, like_count
       FROM cocktails
       WHERE 
        name ILIKE '%' || $1 || '%' 
        OR ingredients ->> 'name' ILIKE '%' || $1 || '%'  
        OR $1 = ANY(tags)
        OR comment ILIKE '%' || $1 || '%'
       ORDER BY id DESC`,
      [keyword]
    );

    const items = rows.map(c => ({
      id: c.id,
      name : c.name,
      image : c.image,
      like_count : c.like_count
    }));

    res.json({
      items
    })
  }catch(err){
    next(err);
  }
});


export default router;