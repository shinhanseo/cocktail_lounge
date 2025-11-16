// src/components/Layout/HeaderList.jsx
// -------------------------------------------------------------
// 🧭 HeaderList
// - 헤더 내 내비게이션 메뉴 목록 컴포넌트
// - 각 메뉴는 NavLink를 사용해 라우터 페이지로 이동
// - 활성화된 페이지는 underline 스타일로 표시
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";

export default function HeaderList() {
  // --- NavLink의 활성 상태에 따라 스타일 지정 ---
  const navClass = ({ isActive }) =>
    "hover:font-bold hover:cursor-pointer underline-offset-8 decoration-2 " +
    (isActive ? "text-title" : "text-white");

  return (
    <>
      {/* --- 내비게이션 메뉴 항목 리스트 --- */}
      <ul className="flex gap-6 list-none text-white">
        {/* 커뮤니티 메뉴 */}
        <li>
          <NavLink to="/community" className={navClass}>
            커뮤니티
          </NavLink>
        </li>

        {/* 오늘의 취향 (추천/테스트 페이지) */}
        <li>
          <NavLink to="/today" className={navClass}>
            AI 바텐더
          </NavLink>
        </li>

        {/* 칵테일 레시피 목록 페이지 */}
        <li>
          <NavLink to="/recipe" className={navClass}>
            칵테일 도감
          </NavLink>
        </li>

        {/* 지역별 바 지도 페이지 */}
        <li>
          <NavLink to="/map" className={navClass}>
            칵테일여지도
          </NavLink>
        </li>

        {/* 추후 추가 예정 메뉴 (예: 이벤트, 리뷰 등) */}
      </ul>
    </>
  );
}
