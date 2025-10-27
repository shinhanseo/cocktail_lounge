// src/db/client.js
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// 싱글턴 풀 (개발환경에서 핫리로드 안전)
const globalForPg = globalThis;
const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

// 간단 쿼리 헬퍼
async function query(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

// 트랜잭션 헬퍼
async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await fn({
      query: (sql, params = []) => client.query(sql, params).then(r => r.rows),
      raw: client, // 필요하면 직접 client 사용
    });
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
console.log("🔗 DATABASE_URL =", process.env.DATABASE_URL);
// 기존처럼 default export 유지(프로젝트 수정 최소화)
const db = { query, tx, pool };
export default db;
export { query, tx, pool };
