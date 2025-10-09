// backend/src/routes/posts.js
import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

router.get("/latest", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 5);
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" },                 
      take: limit,                         
      select: { id: true, title: true, author: true, createdAt: true },
    }); 
    const items = posts.map(p => ({
      id: p.id,
      title: p.title,
      user: p.author,
      createdAt : p.createdAt
    }));
    res.json({ items, meta: { total: items.length } });
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "10", 10), 1);

    const total = await prisma.post.count();
    const pageCount = Math.max(Math.ceil(total / limit), 1);
    const start = (page - 1) * limit;

    // 최신순 정렬 (id 기준 내림차순)
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" },
      skip: start,
      take: limit,
    });

    const items = posts.map((p) => ({
      id: p.id,
      title: p.title,
      user: p.author,
      date: p.date ? p.date.toISOString().slice(0, 10) : null,
      tags: p.tags ?? [],
      body: p.body,
    }));

    res.json({
      items,
      meta: {
        total,
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

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post)
      return res.status(404).json({ message: "Not found" });
    
    res.json({
      id: post.id,
      title: post.title,
      user: post.author,
      date: post.date ? post.date.toISOString().slice(0, 10) : null,
      tags: post.tags ?? [],
      body: post.body,
    });
  } catch (err) {
    next(err);
  }
});


export default router;
