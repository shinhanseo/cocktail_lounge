// AIBartenderPreview.jsx
// -------------------------------------------------------------
// ⚡ AIBartenderPreview 컴포넌트 (홈화면용)
// - “AI 바텐더” 기능 미리보기 카드
// - 기주/맛/키워드 기반 맞춤 칵테일 레시피 생성 소개
// - "AI 레시피 만들기" 클릭 시 JemeniRecommend 페이지로 이동
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";

export default function AIBartenderPreview() {
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
                 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
                 transition-shadow duration-300"
    >
      {/* --- 섹션 헤더 --- */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">🤖 AI 바텐더</h2>
        </div>
      </div>

      {/* --- 본문 영역: 기능 설명 + 미니 프롬프트 박스 --- */}
      <div className="flex flex-col gap-4 mt-2">
        <p className="text-sm text-gray-300 leading-relaxed">
          기주, 원하는 맛, 키워드를 입력하면
          <br />
          AI 바텐더가{" "}
          <span className="text-button font-semibold">
            나만의 칵테일 레시피
          </span>
          를 만들어 줍니다.
        </p>

        {/* 미니 프롬프트 카드 */}
        <div className="flex items-center gap-4 bg-black/30 border border-white/10 rounded-2xl px-4 py-10">
          <div className="flex-1 space-y-2 text-xs text-gray-200">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded-full bg-white/10">
                Gin · Rum
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10">
                상큼 · 달콤
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10">
                레몬 · 민트
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              이런 식으로 취향을 입력하면, 실시간으로 레시피를 생성해드려요.
            </p>
          </div>

          <NavLink
            to="/today"
            className="shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-xl 
                       bg-button hover:bg-button-hover text-[13px] font-semibold
                       shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
          >
            AI 레시피
            <span className="ml-1">→</span>
          </NavLink>
        </div>
      </div>
    </section>
  );
}
