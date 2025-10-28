// src/pages/CommunityList.jsx
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import axios from "axios";

// 라우터로 가져올 헤더 컴포넌트 (경로는 프로젝트 구조에 맞게 조정)
import CommunityHeader from "@/components/community/CommunityHeader";

export default function CommunityList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
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

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/api/posts", {
          params: { page, limit },
        });
        if (ignore) return;
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
      } catch (e) {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [page, limit]);

  const goPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

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

  return (
    <section
      className="w-full max-w-[960px] mx-auto mt-4 text-white bg-white/5 border border-white/10
                 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                 transition-shadow duration-300"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-bold">💬 커뮤니티 게시글 목록</h2>
        <span className="text-sm text-white/70">총 {meta.total}개 게시글</span>
      </div>

      {/* 리스트: 스크롤/스티키 없음. 헤더가 바로 첫 행 */}
      <ul className="divide-y divide-white/10">
        <CommunityHeader />

        {items.map((p, idx) => (
          <li
            key={p.id}
            className="grid grid-cols-[70px_1fr_140px_120px] items-center px-6 py-3
                       hover:bg-white/10 transition-colors"
          >
            <div className="text-center text-white/70">{idx + 1}</div>

            <NavLink
              to={`/posts/${p.id}`}
              state={{ posts: p }}
              className="truncate hover:font-semibold hover:text-white cursor-pointer"
              title={p.title}
            >
              {p.title}
            </NavLink>

            <div className="text-center text-white/70 text-sm">{p.user}</div>
            <div className="text-center text-white/50 text-sm">{p.date}</div>
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
