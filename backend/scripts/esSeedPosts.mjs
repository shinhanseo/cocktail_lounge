// scripts/esSeedPosts.mjs
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import prisma from "../src/db/client.js";
import es from "../src/lib/esClient.js";

const INDEX = "posts_v1";
const STATE = ".es-sync-state.json";

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf-8")); }
  catch { return { lastSync: "1970-01-01T00:00:00.000Z" }; }
}
function saveState(s) { fs.writeFileSync(STATE, JSON.stringify(s)); }

async function main() {
  const { lastSync } = loadState();
  console.log("⏳ lastSync:", lastSync);

  const changed = await prisma.$queryRaw`
    SELECT id, "sourceId", title, author, "date", tags, body, "createdAt", "updatedAt"
    FROM "Post"
    WHERE "updatedAt" > ${new Date(lastSync)}
    ORDER BY "updatedAt" ASC
  `;

  if (!changed?.length) {
    console.log("✅ 변경 없음");
    return;
  }

  const body = changed.flatMap((p) => [
    { index: { _index: INDEX, _id: String(p.id) } },
    {
      id: p.id,
      sourceId: p.sourceId,
      title: p.title ?? "",
      author: p.author ?? "",
      date: p.date ?? null,
      tags: Array.isArray(p.tags) ? p.tags : [],
      body: p.body ?? "",
      createdAt: p.createdAt ?? null,
      updatedAt: p.updatedAt ?? null,
    },
  ]);

  const bulkRes = await es.bulk({ refresh: true, body });
  if (bulkRes.errors) {
    console.dir(bulkRes, { depth: null });
    throw new Error("Bulk sync had errors");
  }

  const last = changed.at(-1).updatedAt;
  const iso = new Date(last).toISOString();
  saveState({ lastSync: iso });
  console.log(`🔁 Synced ${changed.length} docs. lastSync -> ${iso}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
