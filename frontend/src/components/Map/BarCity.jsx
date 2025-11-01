// src/pages/BarCity.jsx
// -------------------------------------------------------------
// 🗺️ BarCity
// - 서버에서 도시 목록을 불러와 카드 그리드로 표시
// - 로딩/에러/빈 목록 상태 각각 처리
// - 도시 카드 클릭 시 해당 도시의 바 목록 페이지(/bars/:city)로 이동
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BarCity() {
  // --- 상태 관리 ---
  const [citys, setCitys] = useState([]); // 도시 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 데이터 불러오기 ---
  useEffect(() => {
    const fetchCity = async () => {
      try {
        setLoading(true);
        setError("");

        // 도시 목록 조회
        const res = await axios.get("http://localhost:4000/api/citys");
        setCitys(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        // 요청 취소 이외 에러만 노출 (axios 취소 코드 보강)
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("도시를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCity();
  }, []);

  // --- 상태별 UI ---
  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;

  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;

  if (citys.length === 0)
    return (
      <div className="text-white text-center py-12">추가된 도시가 없습니다</div>
    );

  // --- 메인 렌더: 도시 카드 그리드 ---
  return (
    <div className="mt-8">
      {/* 상단 카피 */}
      <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-6">
        내 주변의 Bar를 찾아보세요! 🍹
      </h2>

      {/* 도시 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
        {citys.map((c) => (
          <NavLink
            key={c.id}
            to={`/bars/${c.city}`} // 도시 상세 페이지로 이동
            className="group relative rounded-xl border border-white/10 bg-white/5 
                       overflow-hidden text-center shadow-[0_2px_8px_rgba(0,0,0,0.25)]
                       transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
            title={c.city}
          >
            {/* 도시 이미지 */}
            <div className="overflow-hidden">
              <img
                src={c.image}
                alt={c.city}
                className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* 하단 그라데이션+도시명 라벨 */}
            <div
              className="absolute bottom-0 left-0 right-0 py-2
                         bg-gradient-to-t from-black/70 via-black/30 to-transparent
                         text-white text-base font-semibold tracking-wide"
            >
              {c.city}
            </div>

            {/* hover 오버레이 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100
                         bg-black/40 flex items-center justify-center transition-opacity duration-300"
            >
              <p className="text-white font-bold text-sm bg-white/10 rounded-xl px-3 py-1">
                보기 →
              </p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
