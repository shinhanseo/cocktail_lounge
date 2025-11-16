import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AiCocktails() {
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
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/gemeni/save", {
          params: { page, limit },
          withCredentials: true,
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
      } catch (err) {
        console.error("내 AI 레시피 불러오기 오류:", err);
        setError("AI 레시피를 불러오는 중 오류가 발생했습니다.");
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

  if (loading)
    return (
      <div className="text-white text-center mt-10">
        AI 레시피를 불러오는 중...
      </div>
    );
  if (error)
    return <div className="text-red-400 text-center mt-10">{error}</div>;

  return (
    <div className="text-white bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 border-b border-white/20 pb-3">
        🍸 내가 저장한 AI 레시피
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-400 text-center">
          아직 저장한 AI 레시피가 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((c) => (
            <li
              key={c.id}
              onClick={() => navigate(`/ai-cocktails/${c.id}`)} // 라우트는 프로젝트에 맞게 수정
              className="border-b border-white/10 hover:bg-white/5 hover:cursor-pointer rounded-lg px-4 py-3 transition"
              style={{
                width: "700px",
                minWidth: "700px",
                maxWidth: "700px",
              }}
            >
              {/* 상단: 칵테일 이름 + 저장 날짜 */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-white truncate pr-3">
                  {c.name}
                </h3>
                <p className="text-gray-400 text-sm">{c.created_at}</p>
              </div>

              {/* 기주 / 맛 / 키워드 간단 태그 */}
              <div className="flex flex-wrap gap-2 text-xs mt-1 text-gray-300/80">
                {c.base && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    기주: {c.base}
                  </span>
                )}

                {Array.isArray(c.taste) &&
                  c.taste.map((t, idx) => (
                    <span
                      key={`taste-${c.id}-${idx}`}
                      className="px-2 py-0.5 rounded-full bg-cyan-400/5 border border-cyan-400/40 text-cyan-100"
                    >
                      #{t}
                    </span>
                  ))}

                {Array.isArray(c.keywords) &&
                  c.keywords.map((k, idx) => (
                    <span
                      key={`kw-${c.id}-${idx}`}
                      className="px-2 py-0.5 rounded-full bg-emerald-400/5 border border-emerald-400/40 text-emerald-100"
                    >
                      #{k}
                    </span>
                  ))}
              </div>

              {/* 한줄 코멘트 미리보기 */}
              {c.comment && (
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                  “{c.comment}”
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 페이지 네이션 */}
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
