// frontend/src/components/Recipe/RecipeList.jsx
// -------------------------------------------------------------
// 🍸 RecipePreView 컴포넌트 (홈화면용)
// - 서버에서 전체 칵테일 데이터를 불러와 무작위로 1개를 선택하여 표시
// - 데이터 로딩, 오류, 비어있는 상태를 처리
// - 선택된 칵테일은 상세 페이지 링크(`/cocktails/:slug`)로 이동 가능
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RecipePreView() {
  // --- 상태 관리 ---
  const [cocktails, setCocktails] = useState([]); // 전체 칵테일 목록
  const [pick, setPick] = useState(null); // 랜덤으로 선택된 칵테일 1개
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 서버에서 칵테일 목록 불러오기 ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        // API 요청: 전체 칵테일 데이터 조회
        const res = await axios.get("http://localhost:4000/api/cocktails");
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setCocktails(items);
      } catch (err) {
        // 요청이 취소되지 않은 경우에만 에러 표시
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- 목록 로드 후 랜덤 칵테일 선택 ---
  useEffect(() => {
    if (cocktails.length > 0) {
      // 배열 길이를 기준으로 랜덤 인덱스 추출
      const idx = Math.floor(Math.random() * cocktails.length);
      setPick(cocktails[idx] ?? null);
    } else {
      setPick(null);
    }
  }, [cocktails]);

  // --- 상태별 화면 처리 ---
  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!pick) return <div className="text-white">레시피가 없습니다</div>;

  // --- 안전 가드 (slug나 이미지 누락 대비) ---
  const slug = pick.slug ?? pick.id; // slug 없으면 id로 대체
  const imgSrc = pick.image || "/static/cocktails/default.jpg"; // 기본 이미지
  const name = pick.name || "이름 없는 칵테일"; // 기본 이름
  const comment = pick.comment || ""; // 선택적 설명

  // --- 렌더링 ---
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
                 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
                 transition-shadow duration-300"
    >
      {/* 헤더: 제목 + 더보기 버튼 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">🍸 오늘의 추천 한잔</h2>
        <NavLink
          to="/recipe"
          className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
        >
          더보기 →
        </NavLink>
      </div>

      {/* 본문: 랜덤으로 선택된 칵테일 카드 */}
      <div className="flex gap-6 justify-center mt-6">
        <div className="bg-white/10 rounded-2xl p-4 w-[200px] hover:scale-105 transition-all cursor-pointer">
          {/* slug가 존재할 경우만 상세 페이지로 이동 가능 */}
          {slug ? (
            <NavLink
              key={slug}
              to={`/cocktails/${encodeURIComponent(slug)}`}
              state={{ cocktails: pick }}
            >
              <img
                src={imgSrc}
                alt={name}
                className="rounded-xl object-fill h-36 w-full"
                loading="lazy"
              />
            </NavLink>
          ) : (
            // slug가 없을 경우 단순 이미지 표시
            <img
              src={imgSrc}
              alt={name}
              className="rounded-xl object-fill h-36 w-full"
              loading="lazy"
            />
          )}

          {/* 칵테일 이름 및 코멘트 */}
          <h3 className="text-m font-semibold mt-2">{name}</h3>
          {comment && <p className="text-sm text-white/70">{comment}</p>}
        </div>
      </div>
    </section>
  );
}
