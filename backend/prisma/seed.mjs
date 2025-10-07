// prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 각 데이터 파일을 file URL로 지정 (경로는 seed.mjs 기준)
const CITYS_URL     = new URL("../src/data/citys.js", import.meta.url);
const BARS_URL      = new URL("../src/data/bars.js", import.meta.url);
const COCKTAILS_URL = new URL("../src/data/cocktails.js", import.meta.url);
const POSTS_URL     = new URL("../src/data/posts.js", import.meta.url);

// 유틸: export 형태가 달라도 배열을 뽑아오기
async function importArray(url, guessName) {
  const mod = await import(url);
  if (Array.isArray(mod[guessName])) return mod[guessName];
  if (Array.isArray(mod.default))    return mod.default;
  // citys ↔ cities 오타 대비
  if (guessName === "citys" && Array.isArray(mod.cities)) return mod.cities;
  return [];
}
function parseDateMaybe(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function seedCities() {
  const citys = await importArray(CITYS_URL, "citys");
  console.log(`→ City: ${citys.length}`);
  for (const c of citys) {
    const name = c.city ?? c.name;
    await prisma.city.upsert({
      where: { name },
      update: { image: c.image ?? null },
      create: { name, image: c.image ?? null },
    });
  }
}

async function seedBars() {
  const bars = await importArray(BARS_URL, "bars");
  console.log(`→ Bar: ${bars.length}`);
  for (const b of bars) {
    const cityName = b.city?.trim();
    if (!cityName) continue;

    const city =
      (await prisma.city.findUnique({ where: { name: cityName } })) ??
      (await prisma.city.create({ data: { name: cityName } }));

    try {
      await prisma.bar.create({
        data: {
          sourceId: b.id ?? null,          // 스키마에 sourceId가 없으면 이 줄 삭제
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          address: b.address ?? null,
          phone: b.phone ?? null,
          website: b.website ?? null,
          desc: b.desc ?? null,
          image: b.image ?? null,
          cityId: city.id,
        },
      });
    } catch (e) {
      console.warn("⚠️ Bar skipped:", b.name, e.code || e.message);
    }
  }
}

async function seedCocktails() {
  const cocktails = await importArray(COCKTAILS_URL, "cocktails");
  console.log(`→ Cocktail: ${cocktails.length}`);
  for (const c of cocktails) {
    try {
      await prisma.cocktail.upsert({
        where: { slug: c.slug }, // schema에서 slug @unique 권장
        update: {
          name: c.name,
          abv: c.abv ?? null,
          tags: Array.isArray(c.tags) ? c.tags : [],
          ingredients: c.ingredients ?? null, // JSONB
          steps: Array.isArray(c.steps) ? c.steps : [],
          image: c.image ?? null,
          comment: c.comment ?? null,
        },
        create: {
          name: c.name,
          slug: c.slug,
          abv: c.abv ?? null,
          tags: Array.isArray(c.tags) ? c.tags : [],
          ingredients: c.ingredients ?? null,
          steps: Array.isArray(c.steps) ? c.steps : [],
          image: c.image ?? null,
          comment: c.comment ?? null,
        },
      });
    } catch (e) {
      console.warn("⚠️ Cocktail skipped:", c.slug || c.name, e.code || e.message);
    }
  }
}

async function seedPosts() {
  const posts = await importArray(POSTS_URL, "posts");
  console.log(`→ Post: ${posts.length}`);
  for (const p of posts) {
    try {
      await prisma.post.create({
        data: {
          sourceId: typeof p.id === "number" ? p.id : null, // 선택
          title: p.title,
          author: p.user ?? null,            // 문자열 사용자명
          date: parseDateMaybe(p.date),      // "YYYY-MM-DD" → Date
          tags: Array.isArray(p.tags) ? p.tags : [],
          body: (p.body || "").trim(),
        },
      });
    } catch (e) {
      console.warn("⚠️ Post skipped:", p.title, e.code || e.message);
    }
  }
}

async function main() {
  console.log("🔎 start seeding...");
  await seedCities();
  await seedBars();
  await seedCocktails();
  await seedPosts();
  console.log("✅ all done!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
