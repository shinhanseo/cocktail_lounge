import { NavLink } from "react-router-dom";

export default function HeaderList() {
  const navClass = ({ isActive }) =>
    "hover:font-bold hover:cursor-pointer underline-offset-8 decoration-2 " +
    (isActive ? "underline decoration-underline" : "no-underline");

  return (
    <>
      {/* 내비게이션 메뉴 항목 */}
      <ul className="flex gap-6 list-none text-white">
        <li className="hover:font-bold hover:cursor-pointer">
          <NavLink to="/community" className={navClass}>
            커뮤니티
          </NavLink>
        </li>
        <li className="hover:font-bold hover:cursor-pointer">
          <NavLink to="/today" className={navClass}>
            취향 찾기
          </NavLink>
        </li>
        <li className="hover:font-bold hover:cursor-pointer">
          <NavLink to="/recipe" className={navClass}>
            칵테일 도감
          </NavLink>
        </li>
        <li className="hover:font-bold hover:cursor-pointer">
          <NavLink to="/map" className={navClass}>
            칵테일여지도
          </NavLink>
        </li>
        {/* 추가 항목 생성 예정 */}
      </ul>
    </>
  );
}
