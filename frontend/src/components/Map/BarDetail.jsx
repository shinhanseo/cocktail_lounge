// frontend/src/pages/BarDetail.jsx
// -------------------------------------------------------------
// 🧭 BarDetail
// - URL 파라미터 city 기준으로 해당 지역의 Bar 목록을 불러와 지도+리스트로 표시
// - 리스트 항목 클릭 시 지도에서 해당 바로 포커스 (MapCard의 selectedBar 사용)
// - 로딩/에러/빈 데이터 상태 각각 처리
// -------------------------------------------------------------

import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import MapCard from "@/components/Map/MapCard";

export default function BarDetail() {
  // --- URL 파라미터 ---
  const { city } = useParams();

  // --- 상태 관리 ---
  const [bars, setBars] = useState([]); // 전체 바 목록
  const [selectedBar, setSelectedBar] = useState(null); // 선택된 바 (지도 포커스용)
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // 도시가 바뀌면 선택 상태 초기화 (다른 도시로 전환 시 이전 선택 해제)
  useEffect(() => {
    setSelectedBar(null);
  }, [city]);

  // --- 데이터 페치 (전체 bars 가져옴; 실제로는 /api/bars?city=... 형태도 고려 가능) ---
  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`http://localhost:4000/api/bars`);
        setBars(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (!(err.name === "CanceledError" || err.code === "ERR_CANCELED")) {
          setError("Bar를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBar();
  }, []);

  // --- 이벤트 핸들러: 리스트에서 바 선택 시 포커스 이동 ---
  const handleBarSelect = (bar) => setSelectedBar(bar);

  // --- 도시 필터링 (URL city에 해당하는 목록만 지도/리스트에 표시) ---
  const filteredBars = city ? bars.filter((b) => b.city === city) : [];

  // --- 상태별 UI ---
  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  // 전체 바가 비었거나 필터링 후 표시할 데이터가 없을 때
  if (!bars || bars.length === 0 || filteredBars.length === 0) {
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

  // --- 메인 렌더: 좌(지도) / 우(리스트) 2열 구성 ---
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
            selectedBar={selectedBar} // 선택된 바로 포커스
            centerKey={city} // 도시 기준 중심 좌표 선택
            bars={filteredBars} // 지도에 표시할 바 목록
          />
        </div>

        {/* --- 오른쪽: 바 리스트 --- */}
        <aside className="w-[600px] shrink-0 text-white">
          <ul className="mr-12 h-[500px] overflow-y-auto overflow-x-hidden space-y-3 pr-2">
            {filteredBars.map((b) => {
              const isActive = selectedBar && selectedBar.id === b.id;
              return (
                <li
                  key={b.id}
                  className={`
                    flex items-center justify-between gap-4 rounded-2xl px-4 py-3
                    bg-white/5 border border-white/10 shadow-sm
                    hover:bg-white/10 hover:border-pink-400/60 hover:shadow-pink-400/20
                    transition-all duration-300 ease-out cursor-pointer
                    ${
                      isActive
                        ? "border-pink-400 bg-pink-500/10 shadow-pink-500/40"
                        : ""
                    }
                  `}
                  onClick={() => handleBarSelect(b)}
                  title={b.name}
                >
                  {/* 좌: 이름 + 선택 표시 */}
                  <div className="flex flex-col text-left w-[200px]">
                    <span className="font-semibold text-lg">{b.name}</span>
                    {isActive && (
                      <span className="text-pink-400 text-sm">📍 선택됨</span>
                    )}
                  </div>

                  {/* 우: 주소 */}
                  <div className="text-sm text-gray-300 text-right">
                    {b.address}
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
