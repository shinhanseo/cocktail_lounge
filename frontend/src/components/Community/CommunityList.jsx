// src/pages/CommunityList.jsx
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import axios from "axios";

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
          params: { page, limit: 10 },
        });
        if (ignore) return;
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setMeta(res.data?.meta ?? {});
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

  if (loading) return <div className="text-white p-6">불러오는 중...</div>;
  if (error) return <div className="text-red-400 p-6">{error}</div>;
  if (!items.length)
    return <div className="text-white p-6">게시글이 없습니다.</div>;

  return (
    <div className="text-white">
      <ul className="divide-y divide-white/10">
        {items.map((p) => (
          <li
            className="grid grid-cols-[80px_1fr_140px_120px] sm:grid-cols-[80px_1fr_140px_120px]
                       border-white/10 border-b-4 py-2 items-center hover:bg-white/5"
          >
            <div className="text-center">{p.id}</div>
            <NavLink
              to={`/posts/${p.id}`}
              state={{ posts: p }}
              className="text-left pl-2 truncate hover:font-bold hover:cursor-pointer"
            >
              {p.title}
            </NavLink>
            <div className="text-center">{p.user}</div>
            <div className="text-center">{p.date}</div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => goPage(meta.page - 1)}
          disabled={!meta.hasPrev}
          className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-40 hover:cursor-pointer"
        >
          ← 이전
        </button>

        <span className="text-sm text-white/70">
          {meta.page} / {meta.pageCount} (총 {meta.total}개)
        </span>

        <button
          onClick={() => goPage(meta.page + 1)}
          disabled={!meta.hasNext}
          className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-40 hover:cursor-pointer"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
