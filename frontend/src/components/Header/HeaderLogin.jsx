// src/components/HeaderLogin.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

export default function HeaderLogin() {
  const { user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const onLogout = async () => {
    try {
      await api.post("/api/auth/logout", null);
    } finally {
      logout();
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // --- 비로그인 ---
  if (!user) {
    return (
      <Link
        to="/login"
        className="
          inline-flex items-center justify-center
          px-4 py-2 rounded-2xl text-sm font-semibold
          bg-button text-slate-950 border border-button/60
          hover:bg-button-hover hover:border-button-hover
          hover:shadow-md transition
        "
      >
        로그인
      </Link>
    );
  }

  // --- 로그인 ---
  const nickname = user.nickname ?? "User";

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center gap-1.5
          px-4 py-2 rounded-2xl text-sm font-semibold
          bg-button text-slate-950 border border-button/60
          hover:bg-button-hover hover:border-button-hover
          hover:shadow-md transition hover:cursor-pointer
        "
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {nickname}님
        <span
          className={`
            text-slate-900/60 ml-1 transition 
            ${open ? "rotate-180" : ""}
          `}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute top-full right-0 mt-2 w-40
            bg-slate-900/95 backdrop-blur
            border border-white/10
            rounded-xl shadow-xl text-sm text-white
            origin-top-right animate-[fadeIn_0.13s_ease-out]
          "
        >
          <Link
            to="/mypage"
            className="block px-4 py-2 hover:bg-white/5 transition rounded-t-xl"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            마이페이지
          </Link>

          <div className="h-px bg-white/10 mx-2" />

          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 hover:bg-white/5 transition rounded-b-xl hover:cursor-pointer"
            role="menuitem"
          >
            로그아웃
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
