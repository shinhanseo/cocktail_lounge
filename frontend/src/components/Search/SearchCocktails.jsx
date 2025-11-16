import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

export default function SearchCocktails({ keyword }) {
  const [count, setCount] = useState(0);
  const [cocktails, setCocktails] = useState([]); // 칵테일 목록 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  useEffect(() => {
    if (!keyword) return;

    const fetchCocktails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          "http://localhost:4000/api/search/cocktails",
          {
            params: { keyword },
          }
        );
        setCount(Number(res.data.count ?? 0));
        setCocktails(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCocktails();
  }, [keyword]);

  // --- 상태별 화면 표시 ---
  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;

  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;

  if (cocktails.length === 0)
    return (
      <div className="text-white text-center py-12">관련 칵테일이 없습니다</div>
    );

  return (
    <div>
      <p className="text-s font-semibold mb-4 ml-4 text-white">
        🍸“{keyword}” 관련 칵테일 {count}건
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
        {cocktails.map((c) => (
          <NavLink
            key={c.id}
            to={`/cocktails/${c.id}`} // 상세 페이지 이동
            className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden
                       shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-300
                       hover:scale-[1.03] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
          >
            {/* --- 이미지 영역 --- */}
            <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />

              {/* hover 시 어두운 오버레이 및 "더보기" 표시 */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                           bg-black/40 flex items-center justify-center transition-opacity duration-300"
              >
                <span className="text-white font-bold text-sm bg-white/10 rounded-xl px-3 py-1">
                  더보기 →
                </span>
              </div>
            </div>

            {/* --- 하단 텍스트 영역 (칵테일 이름) --- */}
            <div className="py-3 text-center border-t border-white/10 bg-white/5">
              <p className="text-white text-sm md:text-base font-semibold tracking-wide truncate">
                {c.name}
              </p>
              {/* 칵테일 좋아요 개수 표시 */}
              <p className="text-xs text-white/60 mt-1 text-center">
                ❤️ {c.like_count ?? 0}
              </p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
