// src/components/Layout/HeaderList.jsx

import { NavLink } from "react-router-dom";
import { Users, Bot, Wine, MapPinned } from "lucide-react";

export default function HeaderList() {
  const navItems = [
    { to: "/community", label: "커뮤니티", icon: <Users size={16} /> },
    { to: "/today", label: "AI 바텐더", icon: <Bot size={16} /> },
    { to: "/cocktails", label: "칵테일 도감", icon: <Wine size={16} /> },
    { to: "/bars", label: "칵테일여지도", icon: <MapPinned size={16} /> },
  ];

  return (
    <ul className="flex gap-9 list-none">
      {navItems.map((item) => (
        <li key={item.to} className="relative group">
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `
              flex items-center gap-1.5
              px-1 py-1 text-sm tracking-wide

              transition-all duration-300
              ${isActive ? "text-amber-300 font-semibold" : "text-white/80"}

              group-hover:text-white
              group-hover:scale-[1.04]
              transform
            `
            }
          >
            {/* 아이콘 */}
            <span className="opacity-80 group-hover:opacity-100 transition">
              {item.icon}
            </span>

            {/* 텍스트 */}
            {item.label}
          </NavLink>

          {/* hover underline */}
          <span
            className="
              absolute left-0 -bottom-0.5 
              h-[2px] w-0 
              bg-amber-400 rounded-full
              transition-all duration-300
              group-hover:w-full
            "
          />

          {/* active underline */}
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? `
                  absolute left-0 -bottom-0.5 
                  w-full h-[2px]
                  bg-amber-400 rounded-full
                  `
                : "hidden"
            }
          />
        </li>
      ))}
    </ul>
  );
}
