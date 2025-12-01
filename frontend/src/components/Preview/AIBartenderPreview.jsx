// AIBartenderPreview.jsx
// -------------------------------------------------------------
// ⚡ AIBartenderPreview 컴포넌트 (홈화면용)
// - “AI 바텐더” 기능 미리보기 카드
// - 기주/맛/키워드 기반 "빠른 레시피 생성" + "대화형 추천" 소개
// - 버튼 클릭 시 JemeniRecommend(또는 /today)로 이동
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";

export default function AIBartenderPreview() {
  return (
    <section
      className="
        rounded-2xl border border-white/10 p-5 text-white bg-white/5
        shadow-[0_4px_14px_rgba(0,0,0,0.35)]
        hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)]
        transition-all duration-300
      "
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">🤖 AI 바텐더</h2>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        기주/맛 입력하거나, 대화로 취향을 찾아
        <span className="text-button font-semibold"> 나만의 레시피</span>를
        만들어요.
      </p>

      {/* 두 모드 요약 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 빠른 생성 */}
        <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-3">
          <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-lg">
            ⚡ 빠른 생성
          </span>

          <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-gray-200">
            <span className="px-2 py-1 rounded-full bg-white/10">
              <span className="text-amber-400 font-bold">기주</span> : Gin · Rum
              · Wiskey
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10">
              <span className="text-amber-400 font-bold">원하는 맛</span> : 상큼
              · 달콤
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10">
              <span className="text-amber-400 font-bold">키워드</span> : 레몬 ·
              탄산 · 클래식
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10">
              <span className="text-amber-400 font-bold">도수</span> : 30도 이상
              · 15도
            </span>
          </div>

          <NavLink
            to="/today?mode=form"
            className="
              mt-3 block w-full text-center text-[12px] font-semibold
              bg-button hover:bg-button-hover py-1.5 rounded-lg
              transition shadow-md hover:shadow-lg
            "
          >
            레시피 →
          </NavLink>
        </div>

        {/* 대화형 추천 */}
        <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-3">
          <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-lg">
            💬 대화형
          </span>

          {/* 매우 짧은 채팅 프리뷰 */}
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
              <div className="text-[9px] px-2 py-1 rounded-lg bg-white/10">
                어떤 느낌 원해?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="text-[9px] px-2 py-1 rounded-lg bg-button/20">
                상큼하게!
              </div>
            </div>
            <div className="flex gap-1">
              <div className="text-[9px] px-2 py-1 rounded-lg bg-white/10">
                레몬을 넣는건 어때?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="text-[9px] px-2 py-1 rounded-lg bg-button/20">
                레몬보단 라임으로!
              </div>
            </div>
          </div>

          <NavLink
            to="/today?mode=chat"
            className="
              mt-4.5 block w-full text-center text-[12px] font-semibold
              bg-amber-400/90 hover:bg-amber-500/90 py-1.5 rounded-lg
              border border-white/10
              transition shadow-md hover:shadow-lg
            "
          >
            시작하기 →
          </NavLink>
        </div>
      </div>
    </section>
  );
}
