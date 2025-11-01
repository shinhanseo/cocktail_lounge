// frontend/src/components/Map/RamdomBarList.jsx
// -------------------------------------------------------------
// 🍹 RamdomBarList 컴포넌트
// - 서버에서 인기 바(Hot Bar) 목록을 불러와 미리보기 형태로 표시
// - MapPreView 등 홈화면에서 사용됨
// - 각 항목 클릭 시 해당 도시의 바 상세 페이지(/bars/:city)로 이동
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RamdomBarList() {
  // --- 상태 관리 ---
  const [bars, setBars] = useState([]); // 인기 바 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 데이터 불러오기 ---
  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");

        // API 요청: 인기 바 4개 조회
        const res = await axios.get("http://localhost:4000/api/bars/hot", {
          params: { limit: 4 },
        });

        // 응답이 배열인지 확인 후 상태 저장
        setBars(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        // 요청 취소가 아닌 경우만 에러 처리
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("Bar를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBar();
  }, []);

  // --- 상태별 렌더링 ---
  if (loading) return <div className="text-white p-8">불러오는 중...</div>;

  if (error) return <div className="text-red-400 p-8">{error}</div>;

  if (!bars || bars.length === 0)
    return <div className="text-white p-8">정보를 찾을 수 없습니다.</div>;

  // --- 목록 렌더링 ---
  return (
    <>
      {bars.map((bar) => (
        <NavLink
          key={bar.id}
          to={`/bars/${bar.city}`} // 도시별 상세 페이지로 이동
          className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
        >
          {/* 좌측 포인트 점 */}
          <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0"></div>

          {/* 바 이름 / 도시 / 설명 */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{bar.name}</div>
            <div className="text-xs text-gray-400 truncate">
              {bar.city} • {bar.desc}
            </div>
          </div>

          {/* 위치 아이콘 */}
          <div className="text-xs text-teal-400">📍</div>
        </NavLink>
      ))}
    </>
  );
}
