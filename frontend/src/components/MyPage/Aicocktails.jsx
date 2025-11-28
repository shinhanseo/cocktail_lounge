import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

export default function AiCocktails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);
  const keyword = searchParams.get("keyword") ?? "";

  const [keywordInput, setKeywordInput] = useState(keyword);

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

  const handleSearch = () => {
    setSearchParams({
      page: "1",
      limit: String(limit),
      keyword: keywordInput.trim(),
    });
  };

  const goPage = (p) =>
    setSearchParams({
      page: String(p),
      limit: String(limit),
      keyword,
    });

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/gemeni/save", {
          params: { page, limit, keyword },
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
  }, [page, limit, keyword]);

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
      <div className="w-full mb-8 flex items-center justify-between gap-12">
        <h2 className="text-xl font-semibold text-white">
          🍸 내가 저장한 AI 레시피
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative w-64"
        >
          <input
            type="search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="키워드 검색"
            className="
              w-full h-10 bg-white rounded-full border border-black/30
              px-4 pr-10 text-gray-900 placeholder-gray-500
            "
          />

          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400 text-center">검색 결과가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((c) => (
            <li
              key={c.id}
              onClick={() => navigate(`/aicocktails/${c.id}`)}
              className="
                border border-white/10 bg-black/20 hover:bg-white/5 hover:cursor-pointer
                rounded-xl px-4 py-3 transition
              "
            >
              <div className="flex gap-4 items-start">
                {/* 썸네일 */}
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                  {c.imagethumbnail_url ? (
                    <img
                      src={c.imagethumbnail_url}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 텍스트 영역 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1 gap-3">
                    <h3 className="text-lg font-semibold truncate">{c.name}</h3>
                    <p className="text-gray-400 text-sm shrink-0">
                      {c.created_at}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs mt-1 text-gray-300/80">
                    {c.base && (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        기주: {c.base}
                      </span>
                    )}

                    {Number.isFinite(c.abv) && (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        도수: {c.abv}%
                      </span>
                    )}

                    {Array.isArray(c.taste) &&
                      c.taste.map((t) => (
                        <span
                          key={`${c.id}-taste-${t}`}
                          className="px-2 py-0.5 rounded-full bg-cyan-400/5 border border-cyan-400/40 text-cyan-100"
                        >
                          #{t}
                        </span>
                      ))}

                    {Array.isArray(c.keywords) &&
                      c.keywords.map((k) => (
                        <span
                          key={`${c.id}-kw-${k}`}
                          className="px-2 py-0.5 rounded-full bg-emerald-400/5 border border-emerald-400/40 text-emerald-100"
                        >
                          #{k}
                        </span>
                      ))}
                  </div>

                  {c.comment && (
                    <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                      “{c.comment}”
                    </p>
                  )}
                </div>
              </div>
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
