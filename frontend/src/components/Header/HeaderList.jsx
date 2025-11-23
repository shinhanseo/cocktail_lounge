// src/components/Layout/HeaderList.jsx

import { NavLink } from "react-router-dom";

export default function HeaderList() {
  const navClass = ({ isActive }) =>
    `
      relative transition 
      px-1 py-0.5 
      text-sm tracking-wide

      ${isActive ? "text-amber-300 font-semibold" : "text-white/80"}
      hover:text-white
    `;

  return (
    <ul className="flex gap-6 list-none">
      {[
        { to: "/community", label: "커뮤니티" },
        { to: "/today", label: "AI 바텐더" },
        { to: "/recipe", label: "칵테일 도감" },
        { to: "/map", label: "칵테일여지도" },
      ].map((item) => (
        <li key={item.to} className="relative group">
          <NavLink to={item.to} className={navClass}>
            {item.label}
          </NavLink>

          {/* --- 밑줄 효과 --- */}
          <span
            className="
              absolute left-0 -bottom-0.5 w-0 h-[2px] 
              bg-amber-400 rounded-full
              transition-all duration-300
              group-hover:w-full
            "
          />

          {/* --- active 시 하이라이트 라인 --- */}
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? "absolute left-0 -bottom-0.5 w-full h-[2px] bg-amber-400 rounded-full"
                : "hidden"
            }
          />
        </li>
      ))}
    </ul>
  );
}
