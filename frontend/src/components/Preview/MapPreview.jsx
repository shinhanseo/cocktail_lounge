import { NavLink } from "react-router-dom";
import RamdomBarList from "@/components/Map/RamdomBarList";

export default function MapPreView() {
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
               shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
               transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">🗺️ 칵테일여지도</h2>
        <NavLink
          to="/map"
          className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
        >
          더보기 →
        </NavLink>
      </div>

      {/* 인기 바 미리보기 카드들 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">🔥 인기 바</h3>
        <RamdomBarList />
      </div>
    </section>
  );
}
