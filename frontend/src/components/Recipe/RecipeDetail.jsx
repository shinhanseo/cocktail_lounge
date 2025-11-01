// RecipeDetail.jsx
// -------------------------------------------------------------
// 🍸 RecipeDetail 컴포넌트
// - URL의 slug 파라미터를 기반으로 특정 칵테일 상세 정보를 불러옴
// - 로딩 / 에러 / 데이터 표시 3가지 상태를 처리
// - 좌측에는 레시피 설명, 우측에는 이미지 및 코멘트를 표시
// -------------------------------------------------------------

import { useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RecipeDetail() {
  // --- URL 파라미터(slug) 추출 ---
  const { slug } = useParams();

  // --- 상태 관리 ---
  const [cocktail, setCocktail] = useState(null); // 현재 칵테일 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 데이터 불러오기 ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // slug를 이용해 특정 칵테일 데이터 요청
        const res = await axios.get(
          `http://localhost:4000/api/cocktails/${slug}`
        );
        setCocktail(res.data || null);
      } catch (err) {
        setError("칵테일 레시피를 불러오는 도중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // --- 상태별 렌더링 처리 ---
  if (loading) {
    return (
      <article className="max-w-4xl mx-auto mt-12 rounded-2xl p-12 bg-white/5 border border-white/10 text-white shadow-[0_6px_20px_rgba(0,0,0,.35)] animate-pulse">
        불러오는 중...
      </article>
    );
  }

  if (error) return <div className="text-red-400">{error}</div>;

  if (!cocktail) return <div className="text-white">레시피가 없습니다</div>;

  // --- 메인 콘텐츠 렌더링 ---
  return (
    <article
      className="text-white max-w-4xl mx-auto flex flex-col md:flex-row gap-8
                 border border-white/10 bg-white/5 rounded-2xl p-8 md:p-12 mt-12
                 shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                 transition-shadow duration-300 backdrop-blur-[2px]"
    >
      {/* ---------------- 좌측 정보 영역 ---------------- */}
      <div className="flex-1 mr-0 md:mr-8">
        {/* 목록으로 돌아가기 링크 */}
        <NavLink to="/recipe" className="text-sm text-white/70 hover:font-bold">
          ← 목록으로
        </NavLink>

        {/* 칵테일 제목 및 도수 */}
        <h1 className="text-3xl font-extrabold mt-3 mb-2 tracking-tight">
          {cocktail.name}
        </h1>
        <p className="text-white/70 mb-6">도수: ~{cocktail.abv}%</p>

        {/* --- 태그 섹션 --- */}
        {Array.isArray(cocktail.tags) && cocktail.tags.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">태그</h2>
            <ul className="flex gap-2 flex-wrap">
              {cocktail.tags.map((tag) => (
                <li
                  key={tag}
                  className="px-2 py-1 rounded-full text-sm bg-white/10 text-white/90
                             border border-white/10 hover:bg-white/15 hover:scale-105
                             transition-transform"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 구분선 */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent my-6" />

        {/* --- 재료 섹션 --- */}
        {Array.isArray(cocktail.ingredients) &&
          cocktail.ingredients.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-2">재료</h2>
              <ul className="pl-5 space-y-1 marker:text-white/60 list-disc">
                {cocktail.ingredients.map((ing, i) => (
                  <li key={i} className="text-white/90">
                    {ing.name} — {ing.amount}
                  </li>
                ))}
              </ul>
            </section>
          )}

        {/* 구분선 */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent my-6" />

        {/* --- 만드는 법 섹션 --- */}
        {Array.isArray(cocktail.steps) && cocktail.steps.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">만드는 법</h2>
            <ol className="pl-5 space-y-2 list-decimal marker:text-white/60">
              {cocktail.steps.map((step, i) => (
                <li key={i} className="text-white/90 leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* ---------------- 우측 사이드 영역 ---------------- */}
      <aside className="w-full md:w-64 shrink-0">
        {/* 이미지 카드 */}
        <div
          className="rounded-xl overflow-hidden border border-white/10 bg-black/20
                     shadow-[0_8px_24px_rgba(0,0,0,.45)]"
        >
          <img
            src={cocktail.image}
            alt={cocktail.name}
            className="object-cover w-full h-64 md:h-[340px]"
          />
        </div>

        {/* 코멘트 (선택적 표시) */}
        {cocktail.comment && (
          <p className="text-center mt-4 text-gray-300 px-3 py-2 bg-white/10 rounded-xl text-sm border border-white/10">
            {cocktail.comment}
          </p>
        )}
      </aside>
    </article>
  );
}
