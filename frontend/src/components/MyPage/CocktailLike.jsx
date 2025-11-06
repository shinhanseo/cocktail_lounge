import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function CocktailLike() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 6; // 3 x 2 고정

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
        const { data } = await axios.get(
          "http://localhost:4000/api/cocktails/mylike",
          {
            params: { page, limit },
            withCredentials: true,
          }
        );
        if (ignore) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
        setMeta(
          data?.meta ?? {
            total: 0,
            page,
            limit,
            pageCount: 1,
            hasPrev: page > 1,
            hasNext: false,
          }
        );
      } catch (e) {
        if (!ignore)
          setError("좋아요한 칵테일을 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [page]);

  const goPage = (p) => setSearchParams({ page: String(p) });

  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;
  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;

  return (
    <section className="max-w-5xl mx-auto text-white">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center pb-4 border-b border-white/10">
          🍸 내가 좋아요한 칵테일
        </h1>

        {items.length === 0 ? (
          <p className="text-center text-white/60 py-10">
            좋아요한 칵테일이 없습니다.
          </p>
        ) : (
          <>
            {/* 3 x 2 고정 그리드 */}
            <div
              className="grid grid-cols-3 gap-6 mt-6"
              style={{
                width: "700px",
                minWidth: "700px",
                maxWidth: "700px",
              }}
            >
              {items.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/cocktails/${c.id}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden
                             shadow-md hover:shadow-xl hover:scale-[1.02] transition"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name || "Cocktail"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white/90 text-sm font-semibold">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                  <div className="p-3 text-center border-t border-white/10">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-white/60 mt-1">
                      ❤️ {c.like_count ?? 0}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => goPage(meta.page - 1)}
                disabled={!meta.hasPrev}
                className="px-3 py-1 rounded-lg border border-white/10 text-sm text-white/80
                           disabled:opacity-40 hover:bg-white/10 transition"
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
                           disabled:opacity-40 hover:bg-white/10 transition"
              >
                다음 →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
