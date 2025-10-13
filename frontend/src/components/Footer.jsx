import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-white/200 text-white">
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-white/60 flex items-center justify-between gap-4">
          <p>© 2025 Cocktail Lounge. All rights reserved.</p>

          {/* 🔮 네온 스타일 칵테일 라운지 */}
          <p className="mr-12 my-auto text-center">
            <span
              className="relative font-bold text-lg text-[#a6f0ff]
                         drop-shadow-[0_0_4px_#17BEBB]
                         [text-shadow:_0_0_6px_#17BEBB,_0_0_12px_#8B5CF6,_0_0_24px_#17BEBB]
                         animate-footerGlow select-none"
            >
              Cocktail Lounge
            </span>
            <span className="ml-4">오늘의 한잔을 찾다</span>
          </p>

          <div className="flex items-center gap-4">
            <NavLink to="" className="hover:underline underline-offset-4">
              이용약관
            </NavLink>
            <NavLink to="" className="hover:underline underline-offset-4">
              개인정보처리방침
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
