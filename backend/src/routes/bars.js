import { Router } from "express";
import prisma from "../db/client.js"; 

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const bars = await prisma.bar.findMany({
      include: { city: true },      // 도시 이름 같이 불러오기
      orderBy: { id: "asc" },
    });

    // 기존 응답 형태 그대로
    res.json({
      items: bars.map(b => ({
        id: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        city: b.city?.name || null,
        address: b.address,
        phone: b.phone,
        website: b.website,
        desc: b.desc,
        image: b.image,
      })),
      meta: { total: bars.length },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:city", async (req, res, next) => {
  try {
    const cityName = req.params.city;

    const city = await prisma.city.findUnique({ where: { name: cityName } });
    if (!city)
      return res.status(404).json({ message: "도시를 찾을 수 없습니다." });

    const bars = await prisma.bar.findMany({
      where: { cityId: city.id },
      orderBy: { id: "asc" },
    });

    if (bars.length === 0)
      return res.status(404).json({ message: "해당 도시의 바가 없습니다." });

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
        desc: b.desc,
        image: b.image,
      })),
      meta: { total: bars.length },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

