import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";

export default function MyPosts() {
  // --- 쿼리스트링(page, limit) 파싱 ---
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);

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
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false; // 언마운트 이후 setState 방지

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 서버 페이징 요청
        const res = await api.get("/api/posts/mypost", {
          params: { page, limit },
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
  }, [page, limit]);
  // --- 페이지 이동 ---
  const goPage = (p) =>
    setSearchParams({ page: String(p), limit: String(limit) });

  if (loading)
    return (
      <div className="text-white text-center mt-10">게시글 불러오는 중...</div>
    );
  if (error)
    return <div className="text-red-400 text-center mt-10">{error}</div>;

  return (
    <div className="text-white bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 border-b border-white/20 pb-3">
        🗒️ 내가 쓴 게시글
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-400 text-center">
          아직 작성한 게시글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => (
            <li
              key={p.id}
              onClick={() => navigate(`/community/${p.id}`)}
              className="flex justify-between items-center border-b border-white/10 pb-3 hover:bg-white/5 hover:cursor-pointer rounded-lg px-3 py-2 transition"
              style={{
                width: "700px",
                minWidth: "700px",
                maxWidth: "700px",
              }}
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-gray-400 text-sm">{p.date}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-center gap-3 mt-8">
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
    </div>
  );
}
