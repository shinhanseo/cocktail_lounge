// src/components/Layout/HeaderTitle.jsx
// -------------------------------------------------------------
// ✨ HeaderTitle
// - 상단 헤더 로고/타이틀 역할
// - 클릭 시 홈("/")으로 이동
// - 네온 글로우 효과 + 반사(reflect) 애니메이션 적용
// -------------------------------------------------------------

import { Link } from "react-router-dom";

export default function HeaderTitle() {
  return (
    <Link
      to="/"
      className="relative inline-block font-raleway font-bold uppercase tracking-[4px]
                 text-title transition-all duration-500 hover:scale-110
                 p-4 hover:rounded-lg cursor-pointer group"
    >
      {/* --- 네온 그라데이션 glow 배경 --- */}
      <span
        className="absolute inset-0 rounded-lg blur-2xl opacity-60
                   bg-gradient-to-r from-[#17BEBB]/70 via-[#8B5CF6]/50 to-[#17BEBB]/70
                   animate-neonGlow"
      ></span>

      {/* --- 메인 타이틀 텍스트 --- */}
      <span
        style={{
          // 아래쪽에 반사 효과 (WebKit 전용)
          WebkitBoxReflect:
            "below 1px linear-gradient(transparent, rgba(0,0,0,0.4))",
        }}
        className="relative z-10 text-[#b9faff]
                   [text-shadow:_0_0_10px_#17BEBB,_0_0_20px_#8B5CF6,_0_0_40px_#17BEBB]
                   transition-all duration-500 select-none group-hover:text-[#e0faff]"
      >
        Cocktail Lounge
      </span>
    </Link>
  );
}
