// src/pages/CommunityList.jsx
// -------------------------------------------------------------
// 💬 CommunityList
// - 커뮤니티 게시글 목록 페이지
// - URL 쿼리(page, limit) 기반 서버 페이징
// - 로딩/에러/빈 목록 상태 처리 + 페이지네이션
// -------------------------------------------------------------

import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import axios from "axios";

// 리스트 헤더(번호/제목/작성자/날짜)
import CommunityHeader from "@/components/community/CommunityHeader";

export default function CommunityList() {
  // --- 쿼리스트링(page, limit) 파싱 ---
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  // --- 목록/메타/상태 ---
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit,
    pageCount: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 데이터 불러오기 (page/limit 변화 시 재요청) ---
  useEffect(() => {
    let ignore = false; // 언마운트 이후 setState 방지

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 서버 페이징 요청
        const res = await axios.get("/api/posts", { params: { page, limit } });
        if (ignore) return;

        // 목록/메타 갱신 (방어 코드 포함)
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setMeta(
          res.data?.meta ?? {
            total: 0,
            page,
            limit,
            pageCount: 1,
            hasPrev: page > 1,
            hasNext: false,
          }
        );
      } catch {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [page, limit]);

  // --- 페이지 이동 ---
  const goPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

  // --- 상태별 UI ---
  if (loading) {
    return (
      <section className="w-full max-w-[960px] mx-auto mt-12 text-white bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse shadow-[0_6px_20px_rgba(0,0,0,.35)]">
        불러오는 중...
      </section>
    );
  }
  if (error) return <div className="text-red-400 p-6">{error}</div>;

  if (!items.length) {
    return (
      <section
        className="w-full max-w-[960px] mx-auto mt-4 text-white bg-white/5 border border-white/10
                   rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                   transition-shadow duration-300"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold">💬 커뮤니티 게시글 목록</h2>
          <span className="text-sm text-white/70">총 0개 게시글</span>
        </div>
      </section>
    );
  }

  // --- 메인 렌더: 리스트 + 페이지네이션 ---
  return (
    <section
      className="w-full max-w-[960px] mx-auto mt-4 text-white bg-white/5 border border-white/10
                 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                 transition-shadow duration-300"
    >
      {/* 상단 타이틀/총 개수 */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-bold">💬 커뮤니티 게시글 목록</h2>
        <span className="text-sm text-white/70">총 {meta.total}개 게시글</span>
      </div>

      {/* 리스트: 첫 행에 헤더 렌더 */}
      <ul className="divide-y divide-white/10">
        <CommunityHeader />

        {items.map((p, idx) => (
          <li
            key={p.id}
            className="grid grid-cols-[70px_1fr_140px_120px_60px] items-center px-6 py-3
                       hover:bg-white/10 transition-colors"
          >
            {/* 번호: 최신이 위이므로 역순 번호 계산 */}
            <div className="text-center text-white/70">
              {meta.total - (meta.page - 1) * meta.limit - idx}
            </div>

            {/* 제목 */}
            <NavLink
              to={`/posts/${p.id}`}
              state={{ posts: p }}
              className="truncate hover:font-semibold hover:text-white cursor-pointer"
              title={p.title}
            >
              {p.title}
            </NavLink>

            {/* 작성자 / 작성일 */}
            <div className="text-center text-white/70 text-sm">{p.user}</div>
            <div className="text-center text-white/50 text-sm">{p.date}</div>
            <div className="text-center text-white/50 text-sm">
              {p.comment_count}개
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-3 py-5">
        <button
          onClick={() => goPage(meta.page - 1)}
          disabled={!meta.hasPrev}
          className="px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                     disabled:opacity-40 hover:bg-white/10 transition-colors hover:cursor-pointer"
        >
          ← 이전
        </button>

        <span className="text-sm text-white/70">
          {meta.page} / {meta.pageCount}
        </span>

        <button
          onClick={() => goPage(meta.page + 1)}
          disabled={!meta.hasNext}
          className="px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                     disabled:opacity-40 hover:bg-white/10 transition-colors hover:cursor-pointer"
        >
          다음 →
        </button>
      </div>
    </section>
  );
}
