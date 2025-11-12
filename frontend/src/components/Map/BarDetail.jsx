// frontend/src/pages/BarDetail.jsx
// -------------------------------------------------------------
// 🧭 BarDetail
// - city 파라미터 기준으로 목록 + 지도
// - '바 이름'을 클릭하면 선택(지도 포커스)
// - 행 전체는 hover 스타일만 적용(클릭 X)
// - 우측 북마크 버튼은 선택과 분리된 UI 토글
// -------------------------------------------------------------

import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import MapCard from "@/components/Map/MapCard";
import BarBookmarkButton from "@/components/Like/BarBookmarkButton";

export default function BarDetail() {
  // --- URL 파라미터 ---
  const { city } = useParams();

  // --- 상태 관리 ---
  const [bars, setBars] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 도시 변경 시 선택 초기화
  useEffect(() => {
    setSelectedBar(null);
  }, [city]);

  // 데이터 로드
  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:4000/api/bars/${city}`);
        setBars(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (!(err?.name === "CanceledError" || err?.code === "ERR_CANCELED")) {
          setError("Bar를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBar();
  }, []);

  const handleBarSelect = (bar) => setSelectedBar(bar);

  // --- 상태별 UI ---
  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  if (!bars || bars.length === 0) {
    return (
      <div className="w-full mt-12 text-white">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold">{city}</h2>
        </div>
        <div className="mb-4">
          <NavLink to="/map" className="text-sm text-white/70 hover:font-bold">
            ← 목록으로
          </NavLink>
        </div>
        <div className="text-center text-gray-400 py-10">
          선택한 지역의 Bar 정보가 없습니다
        </div>
      </div>
    );
  }

  // --- 메인 렌더 ---
  return (
    <div className="w-full mt-12">
      {/* 제목 */}
      <div className="w-full text-white text-center mb-6">
        <h2 className="text-3xl font-bold">{city}</h2>
      </div>

      {/* 상단 네비게이션 */}
      <div className="mb-4">
        <NavLink to="/map" className="text-sm text-white/70 hover:font-bold">
          ← 목록으로
        </NavLink>
      </div>

      <div className="flex gap-6 items-start">
        {/* --- 왼쪽: 지도 --- */}
        <div className="flex-1">
          <MapCard
            height={500}
            width="100%"
            selectedBar={selectedBar}
            centerKey={city}
            bars={bars}
          />
        </div>

        {/* --- 오른쪽: 바 리스트 --- */}
        <aside className="w-[600px] shrink-0 text-white">
          <ul className="mr-12 h-[500px] overflow-y-auto overflow-x-hidden space-y-3 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {bars.map((b) => {
              const isActive = selectedBar && selectedBar.id === b.id;
              return (
                <li
                  key={b.id}
                  className={`
                    grid grid-cols-[200px_minmax(0,1fr)_120px] items-center gap-4 rounded-2xl px-4 py-3
                    bg-white/5 border border-white/10 shadow-sm
                    hover:bg-white/10 hover:border-pink-400/60 hover:shadow-pink-400/20
                    transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "border-pink-400 bg-pink-500/10 shadow-pink-500/40"
                        : ""
                    }
                  `}
                  title={b.name}
                >
                  {/* 이름 */}
                  <div>
                    <span
                      onClick={() => handleBarSelect(b)}
                      className="font-semibold text-lg hover:cursor-pointer"
                    >
                      {b.name}
                    </span>
                    {isActive && (
                      <span className="block text-pink-400 text-sm">
                        📍 선택됨
                      </span>
                    )}
                  </div>

                  {/* 주소 */}
                  <div className="min-w-0 text-sm text-gray-300 text-right">
                    <span className="block truncate">{b.address}</span>
                  </div>

                  {/* 액션 */}
                  <div className="flex items-center justify-end gap-2">
                    <BarBookmarkButton id={b.id} onClick={() => fetchBar()} />
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
