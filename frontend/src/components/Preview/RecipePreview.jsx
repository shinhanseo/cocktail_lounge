// frontend/src/components/Recipe/RecipeList.jsx

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// 새로운 타입 정보를 추가 (도수, 주재료 등)
// *주의: 서버 데이터(pick)에 'base', 'ABV' 등의 필드가 있다고 가정하고 추가했습니다.*
// *실제 데이터 구조에 맞게 필드명을 수정해야 합니다.*

// Icon Placeholder (실제 프로젝트에서는 React-icons 등으로 대체)
const Icon = ({ className, children }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

export default function RecipePreView() {
  // --- 상태 관리 ---
  const [cocktails, setCocktails] = useState([]);
  const [pick, setPick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 서버에서 칵테일 목록 불러오기-
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/cocktails");
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setCocktails(items);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (cocktails.length > 0) {
      const idx = Math.floor(Math.random() * cocktails.length);
      setPick(cocktails[idx] ?? null);
    } else {
      setPick(null);
    }
  }, [cocktails]);

  if (loading)
    return <div className="text-white">🍹 오늘의 추천 한잔... 불러오는 중</div>;
  if (error) return <div className="text-red-400">🚨 {error}</div>;
  if (!pick) return <div className="text-white">🍹 레시피가 없습니다.</div>;

  // --- 안전 가드 및 데이터 추출 ---
  const slug = pick.slug ?? pick.id;
  const imgSrc = pick.image || "/static/cocktails/default.jpg";
  const name = pick.name || "이름 없는 칵테일";
  const comment = pick.comment || "이 칵테일의 특징을 알려주세요.";

  const tags = pick.tags || "균형 잡힌 맛"; // 맛
  const ABV = pick.abv || "알 수 없음"; // 알코올 도수

  // --- 렌더링 ---
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
                 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
                 transition-shadow duration-300 h-full flex flex-col" // flex-col 및 h-full 추가
    >
      {/* 1. 헤더: 제목 + 더보기 버튼 (디자인 변경 없음) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon className="text-amber-400">🥂</Icon> 오늘의 추천 한잔
        </h2>
        <NavLink
          to="/recipe"
          className="text-amber-300 text-sm font-semibold hover:text-white transition-colors"
        >
          레시피 도감 →
        </NavLink>
      </div>

      {/* 2. 본문: 랜덤으로 선택된 칵테일 카드 (레이아웃 및 스타일 변경) */}
      <NavLink
        to={slug ? `/cocktails/${encodeURIComponent(slug)}` : "#"}
        className="group flex-grow block" // flex-grow를 통해 남은 공간을 차지
      >
        <div
          className="flex gap-4 p-3 bg-white/10 rounded-xl transition-all duration-300 h-full
                        group-hover:bg-white/15 group-hover:shadow-lg"
        >
          {/* 2-1. 이미지 섹션 (왼쪽) */}
          <div className="flex-shrink-0 w-2/5 max-w-[140px] md:max-w-[160px] relative overflow-hidden rounded-xl">
            <img
              src={imgSrc}
              alt={name}
              className="w-full h-full object-cover rounded-xl transition-transform duration-500
                         group-hover:scale-110" // 호버 시 이미지 확대 효과
              loading="lazy"
            />
            {/* 이미지 위에 약간의 오버레이 효과 추가 */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* 2-2. 텍스트 섹션 (오른쪽) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="mb-2">
              <h3 className="text-2xl font-extrabold text-amber-300 group-hover:text-amber-200 transition-colors truncate">
                {name}
              </h3>
              <p className="text-sm text-white/80 mt-1 line-clamp-2">
                {comment}
              </p>
            </div>

            {/* 추가 정보 (Feature Tags) */}
            <div className="flex flex-wrap gap-2 text-xs">
              {/* 맛 */}
              <div>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-medium mr-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {/* 도수 */}
              <div className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 font-medium">
                도수 : {ABV}%
              </div>
            </div>

            <p className="text-xs mt-3 text-amber-400 font-medium">
              자세히 보기
            </p>
          </div>
        </div>
      </NavLink>
    </section>
  );
}
