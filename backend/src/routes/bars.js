// src/routes/bars.js
import { Router } from 'express';
import db from '../db/client.js';

const router = Router();

// GET /bars/hot?limit=4
router.get('/hot', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 4);

    const rows = await db.query(
      `SELECT b.id, b.name, b.comment AS desc, c.name AS city
       FROM bars b
       LEFT JOIN cities c ON c.id = b.city_id
       ORDER BY b.id DESC
       LIMIT $1`,
      [limit]
    );

    const items = rows.map(b => ({
      id: b.id,
      name: b.name,
      desc: b.desc ?? null,
      city: b.city ?? null,
    }));

    res.json({ items, meta: { total: items.length } });
  } catch (e) {
    next(e);
  }
});

// GET /bars
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT b.*, c.name AS city_name
       FROM bars b
       LEFT JOIN cities c ON c.id = b.city_id
       ORDER BY b.id ASC`
    );

    res.json({
      items: rows.map(b => ({
        id: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        city: b.city_name ?? null,
        address: b.address,
        phone: b.phone,
        website: b.website,
        desc: b.comment ?? null,   
        image: null,              
      })),
      meta: { total: rows.length },
    });
  } catch (e) {
    next(e);
  }
});

// GET /bars/:city  (예: /bars/서울)
router.get('/:city', async (req, res, next) => {
  try {
    const cityName = req.params.city;

    const cityRows = await db.query(
      `SELECT id, name FROM cities WHERE name = $1`,
      [cityName]
    );
    const city = cityRows[0];
    if (!city) return res.status(404).json({ message: '도시를 찾을 수 없습니다.' });

    const bars = await db.query(
      `SELECT id, name, lat, lng, address, phone, website, comment
       FROM bars
       WHERE city_id = $1
       ORDER BY id ASC`,
      [city.id]
    );

    if (bars.length === 0)
      return res.status(404).json({ message: '해당 도시의 바가 없습니다.' });

    res.json({
      items: bars.map(b => ({
        id: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        city: cityName,
        address: b.address,
        phone: b.phone,
        website: b.website,
        desc: b.comment ?? null, // ← comment → desc
      })),
      meta: { total: bars.length },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
