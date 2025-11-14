// frontend/src/components/Recipe/RecipeList.jsx
// -------------------------------------------------------------
// 🧊 RecipeList 컴포넌트
// - 서버에서 칵테일 레시피 목록을 불러와 그리드 형태로 표시
// - 로딩, 에러, 빈 데이터 상태 처리
// - 정렬(sort): 최신순 / 좋아요순 / 도수순
// - 상세 페이지 진입 후 목록으로 돌아올 때 정렬 유지
// -------------------------------------------------------------

import { NavLink, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import RecipeFilter from "@/components/Recipe/RecipeFilter";

export default function RecipeList() {
  // --- 쿼리스트링(sort) 관리 ---
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") ?? "latest"; // 기본값: 최신순
  const bases = searchParams.get("bases") ?? ""; // "진,럼" 이런 문자열
  const tastes = searchParams.get("tastes") ?? ""; // "달콤한,상큼한"
  const location = useLocation(); // 현재 경로 + 쿼리(/recipe?sort=likes 등)

  // --- 상태 관리 ---
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 정렬 변경 함수 ---
  const changeSort = (nextSort) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sort", nextSort);
      return next;
    });
  };

  // --- 데이터 불러오기 ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        // 서버에서 칵테일 데이터 요청 (정렬 기준 전달)
        const res = await axios.get("http://localhost:4000/api/cocktails", {
          params: {
            sort,
            bases,
            tastes,
          }, // latest / likes / abv
        });

        setCocktails(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sort, bases, tastes]);

  // --- 상태별 화면 표시 ---
  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;

  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;

  // --- 렌더링 영역 ---
  return (
    <div className="mt-8 max-w-7xl mx-auto px-4">
      {/* 제목 + 정렬 버튼 (상단 전체 폭) */}
      <div className="relative mb-6">
        {/* 제목은 가운데 */}
        <h2 className="text-center text-white text-xl md:text-2xl font-bold">
          다양한 칵테일 레시피를 만나보세요 🍸
        </h2>

        {/* 정렬 버튼은 오른쪽 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
          {/* 최신순 */}
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

          {/* 좋아요순 */}
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

          {/* 도수순 */}
          <button
            onClick={() => changeSort("abv")}
            className={`px-3 py-1 text-xs rounded-full border ${
              sort === "abv"
                ? "bg-white text-black border-white"
                : "border-white/30 text-white/70 hover:bg-white/10 hover:cursor-pointer"
            }`}
          >
            도수순
          </button>
        </div>
      </div>

      {/* 여기서부터: 왼쪽 필터 + 오른쪽 카드 그리드 */}
      <div className="flex flex-col md:flex-row gap-6">
        <RecipeFilter />
        {/* 왼쪽 필터 */}

        {/* 오른쪽 카드 그리드 */}
        <div
          className="flex-1"
          style={{
            width: "1000px",
            minWidth: "1000px",
            maxWidth: "1000px",
          }}
        >
          {cocktails.length === 0 ? (
            <div className="text-white text-2xl text-center mt-12 font-bold">
              레시피가 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {cocktails.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/cocktails/${c.id}`}
                  // 상세에서 "목록으로" 눌렀을 때 돌아갈 경로를 state로 같이 넘김
                  state={{ from: location.pathname + location.search }}
                  className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden
                  shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-300
                  hover:scale-[1.03] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                >
                  {/* 이미지 */}
                  <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-black/40 flex items-center justify-center transition-opacity duration-300"
                    >
                      <span className="text-white font-bold text-sm bg-white/10 rounded-xl px-3 py-1">
                        더보기 →
                      </span>
                    </div>
                  </div>

                  {/* 텍스트 영역 */}
                  <div className="py-3 text-center border-t border-white/10 bg-white/5">
                    <p className="text-white text-sm md:text-base font-semibold tracking-wide truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      ❤️ {c.like_count ?? 0} | 🍶 {c.abv ?? 0}%
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
