// src/components/Recipe/JemeniGuideModal.jsx
import { createPortal } from "react-dom";

export default function GuideModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* 카드 */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-slate-900 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-5 text-gray-100">
        {/* 상단 바*/}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            맞춤 칵테일 가이드
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 1. 기주 */}
        <section className="mb-3">
          <h4 className="text-sm font-semibold mb-1">
            1. 기주(주인공이 되는 술)
          </h4>
          <ul className="text-[11px] space-y-0.5 leading-relaxed">
            <li>• 진(Gin) 시원한 허브 계열 향, 40도 이상 증류주</li>
            <li>• 럼(Rum) 당밀·사탕수수 기반의 달콤한 향</li>
            <li>• 보드카(Vodka) 무색·무취·무미의 깔끔한 술</li>
            <li>• 테킬라(Tequila) 아가베 향 기반의 개성 강한 술</li>
            <li>• 브랜디(Brandy) 과일 증류주, 단맛과 향이 풍부</li>
            <li>• 위스키(Whisky) 곡물 발효·숙성 향의 고도수 술</li>
            <li>• 리큐르(Liqueur) 과일·허브 풍미의 달콤한 술(15도 전후)</li>
          </ul>
        </section>

        {/* 2. 원하는맛 */}
        <section className="mb-3">
          <h4 className="text-sm font-semibold mb-1">
            2. 원하는 맛 (중복 선택 가능)
          </h4>
          <ul className="text-[11px] space-y-0.5 leading-relaxed">
            <li>• 술 본연의 깔끔함</li>
            <li>• 과일의 상큼함</li>
            <li>• 과일의 달콤함</li>
            <li>• 커피·초콜릿의 달콤함</li>
            <li>• 허브·약초의 쌉싸름함</li>
            <li>• 탄산의 청량감</li>
          </ul>

          <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
            ※ 이는 참고일 뿐이며 원하시는 맛을 자유롭게 기술하셔도 됩니다.{" "}
          </p>
        </section>

        {/* 3. 도수 가이드 */}
        <section className="mb-3">
          <h4 className="text-sm font-semibold mb-1">3. 도수(ABV) 가이드</h4>
          <ul className="text-[11px] space-y-0.5 leading-relaxed">
            <li>• 아주 약하게 5% 이하</li>
            <li>• 약하게 10 ~ 20%</li>
            <li>• 적당히 20 ~ 30%</li>
            <li>• 강하게 30% 이상</li>
          </ul>

          {/* 도수 안내 문구 */}
          <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
            ※ 입력하신 도수(ABV)는 원하는 기주, 맛, 키워드를 우선적으로 반영하는
            과정에서 실제 레시피의 도수와 정확히 일치하지 않을 수 있습니다. 제조
            시 취향에 맞게 한 번 더 조절해 주세요.
          </p>
        </section>
      </div>
    </div>,
    document.body
  );
}
