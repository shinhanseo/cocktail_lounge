// frontend/src/components/Recipe/RecipeList.jsx
// -------------------------------------------------------------
// 🧊 RecipeList 컴포넌트
// - 서버에서 칵테일 레시피 목록을 불러와 그리드 형태로 표시
// - 로딩, 에러, 빈 데이터 상태를 각각 처리
// - 각 레시피 클릭 시 상세 페이지로 이동 (React Router NavLink 사용)
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RecipeList() {
  // --- 상태 관리 ---
  const [cocktails, setCocktails] = useState([]); // 칵테일 목록 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 데이터 불러오기 ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // 서버에서 칵테일 데이터 요청
        const res = await axios.get("http://localhost:4000/api/cocktails");
        // 응답 데이터가 배열이면 cocktails에 저장
        setCocktails(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        // 취소 오류 외의 에러 처리
        if (err.name !== "CanceledError") {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- 상태별 화면 표시 ---
  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;

  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;

  if (cocktails.length === 0)
    return (
      <div className="text-white text-center py-12">레시피가 없습니다</div>
    );

  // --- 렌더링 영역 ---
  return (
    <div className="mt-8">
      {/* 섹션 제목 */}
      <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-6">
        다양한 칵테일 레시피를 만나보세요 🍸
      </h2>

      {/* 레시피 카드 그리드 */}
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
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
