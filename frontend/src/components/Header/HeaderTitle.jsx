import { Link } from "react-router-dom";

export default function HeaderTitle() {
  return (
    <Link
      to="/"
      className="relative inline-block font-raleway font-bold uppercase tracking-[4px]
               text-title transition-all duration-500 hover:scale-110
               p-4 hover:rounded-lg cursor-pointer group"
    >
      {/* 네온 그라데이션 glow 배경 */}
      <span className="absolute inset-0 rounded-lg blur-2xl opacity-60 bg-gradient-to-r from-[#17BEBB]/70 via-[#8B5CF6]/50 to-[#17BEBB]/70 animate-neonGlow"></span>

      <span
        style={{
          WebkitBoxReflect:
            "below 1px linear-gradient(transparent, rgba(0,0,0,0.4))",
        }}
        className="relative z-10 text-[#b9faff]
                 adow-[0_0_6px_#17BEBB]
                  [text-shadow:_0_0_10px_#17BEBB,_0_0_20px_#8B5CF6,_0_0_40px_#17BEBB]
                  transition-all duration-500 select-none group-hover:text-[#e0faff]"
      >
        Cocktail Lounge
      </span>
    </Link>
  );
}
