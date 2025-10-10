import { Link, NavLink } from "react-router-dom";
import search from "@/assets/search.svg";

const navClass = ({ isActive }) =>
  "hover:font-bold hover:cursor-pointer underline-offset-8 decoration-2 " +
  (isActive ? "underline decoration-underline" : "no-underline");

export default function Header() {
  return (
    <header>
      <nav className="flex items-center justify-between text-white text-sm p-6 border-b border-white/10 bg-white/200">
        {/* 왼쪽 상단 웹 이름 */}
        <Link
          to="/"
          className="relative inline-block font-raleway font-bold uppercase tracking-[4px]
             text-title transition-all duration-500 hover:text-[#050801] hover:bg-title
             p-4 hover:rounded-lg cursor-pointer "
        >
          <span className="absolute inset-0 border-2 border-title animate-borderGlow rounded-lg"></span>
          <span className="relative z-10">Cocktail Lounge</span>
        </Link>

        {/* 검색창 */}
        <form className="flex justify-center relative">
          <input
            type="search"
            placeholder="오늘의 한잔을 찾아보세요."
            className="w-150 h-10 
                          bg-white rounded-4xl border-2 
                          border-black/50 px-4 pr-10
                          text-gray-900 placeholder-gray-500"
          ></input>
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
          >
            <img src={search} className="w-5 h-5 text-gray-500"></img>
          </button>
        </form>

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

        {/* 로그인 버튼 */}
        <p
          className="hover:font-bold 
                     hover:cursor-pointer 
                     text-white
                     px-4 
                     py-2
                     border border-button
                     bg-button 
                     rounded-3xl 
                     hover:bg-button-hover 
                     hover:border-button-hover"
        >
          <Link to="/login">로그인</Link>
        </p>
      </nav>
    </header>
  );
}
