// src/pages/CommunityList.jsx
// -------------------------------------------------------------
// 💬 CommunityList
// - 커뮤니티 게시글 목록 페이지
// - URL 쿼리(page, limit, sort) 기반 서버 페이징 & 정렬
// - 로딩/에러/빈 목록 상태 처리 + 페이지네이션
// -------------------------------------------------------------

import { useEffect, useState } from "react";
import { NavLink, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

// 리스트 헤더(번호/제목/작성자/날짜)
import CommunityHeader from "@/components/community/CommunityHeader";

export default function CommunityList() {
  // --- 쿼리스트링(page, limit, sort) 파싱 ---
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const sort = searchParams.get("sort") ?? "latest"; // 기본값: 최신순

  const location = useLocation(); // 🔥 현재 경로 + 쿼리 (/community?page=1&sort=likes)

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

  // --- 데이터 불러오기 (page/limit/sort 변화 시 재요청) ---
  useEffect(() => {
    let ignore = false; // 언마운트 이후 setState 방지

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 서버 페이징 + 정렬 요청
        const res = await axios.get("/api/posts", {
          params: { page, limit, sort },
        });
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
  }, [page, limit, sort]); // sort 바뀌어도 재요청

  // --- 페이지 이동 ---
  const goPage = (p) =>
    setSearchParams({
      page: String(p),
      limit: String(limit),
      sort, // 현재 정렬 유지
    });

  // --- 정렬 변경 (최신순 / 좋아요순) ---
  const changeSort = (nextSort) =>
    setSearchParams({
      page: "1", // 정렬 바뀌면 1페이지부터
      limit: String(limit),
      sort: nextSort,
    });

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
        {/* 상단 타이틀 + 정렬 버튼 + 총 개수 */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold">💬 커뮤니티 게시글 목록</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeSort("latest")}
              className={`px-3 py-1 text-xs rounded-full border hover:cursor-pointer${
                sort === "latest"
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-white/70 hover:bg-white/10"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => changeSort("likes")}
              className={`px-3 py-1 text-xs rounded-full border hover:cursor-pointer ${
                sort === "likes"
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-white/70 hover:bg-white/10"
              }`}
            >
              좋아요순
            </button>
            <button
              onClick={() => changeSort("comments")}
              className={`px-3 py-1 text-xs rounded-full border hover:cursor-pointer ${
                sort === "comments"
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-white/70 hover:bg-white/10"
              }`}
            >
              댓글순
            </button>

            <span className="text-sm text-white/70 ml-3">총 0개 게시글</span>
          </div>
        </div>

        <div className="px-6 pb-6 text-sm text-white/60">
          아직 작성된 게시글이 없습니다. 첫 번째 글의 주인공이 되어보세요!
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
      {/* 상단 타이틀/정렬/총 개수 */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-bold">💬 커뮤니티 게시글 목록</h2>

        <div className="flex items-center gap-2">
          {/* 정렬 버튼들 */}
          <button
            onClick={() => changeSort("latest")}
            className={`px-3 py-1 text-xs rounded-full border ${
              sort === "latest"
                ? "bg-white text-black border-white"
                : "border-white/30 text-white/70 hover:bg-white/10 hover:cursor-pointer"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => changeSort("likes")}
            className={`px-3 py-1 text-xs rounded-full border ${
              sort === "likes"
                ? "bg-white text-black border-white"
                : "border-white/30 text-white/70 hover:bg-white/10 hover:cursor-pointer"
            }`}
          >
            좋아요순
          </button>
          <button
            onClick={() => changeSort("comments")}
            className={`px-3 py-1 text-xs rounded-full border ${
              sort === "comments"
                ? "bg-white text-black border-white"
                : "border-white/30 text-white/70 hover:bg-white/10 hover:cursor-pointer"
            }`}
          >
            댓글순
          </button>
          {/* 총 개수 */}
          <span className="text-sm text-white/70 ml-3">
            총 {meta.total}개 게시글
          </span>
        </div>
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
              {meta.total - (meta.page - 1) * meta.limit - idx}.
            </div>

            {/* 제목 */}
            <NavLink
              to={`/posts/${p.id}`}
              state={{
                posts: p, // 기존에 쓰던 거 유지
                from: location.pathname + location.search, // 리스트 상태 보존용
              }}
              className="truncate hover:font-semibold hover:text-white cursor-pointer"
              title={p.title}
            >
              {p.title}
              <span className="text-center text-white/50 text-sm ml-2">
                [{p.comment_count}개]
              </span>
            </NavLink>

            {/* 작성자 / 작성일 */}
            <div className="text-center text-white/70 text-sm">{p.user}</div>
            <div className="text-center text-white/50 text-sm">{p.date}</div>

            {/* 좋아요 수 */}
            <div className="text-center text-white/50 text-sm">
              <span className="mr-2">❤️</span>
              {p.like_count ?? 0}
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-3 mt-8 mb-8">
        <button
          onClick={() => goPage(meta.page - 1)}
          disabled={!meta.hasPrev}
          className={`px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                      disabled:opacity-40 hover:bg-white/10 transition
                      ${meta.hasPrev ? "cursor-pointer" : "cursor-default"}`}
        >
          ← 이전
        </button>
        <span className="text-sm text-white/70">
          {meta.page} / {meta.pageCount}
        </span>
        <button
          onClick={() => goPage(meta.page + 1)}
          disabled={!meta.hasNext}
          className={`px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                      disabled:opacity-40 hover:bg-white/10 transition
                      ${meta.hasNext ? "cursor-pointer" : "cursor-default"}`}
        >
          다음 →
        </button>
      </div>
    </section>
  );
}
