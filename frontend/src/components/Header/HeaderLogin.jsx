// src/components/HeaderLogin.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function HeaderLogin() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const onLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/logout");
    } finally {
      logout();
      setOpen(false);
    }
  };

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // 비로그인 상태: 로그인 버튼만
  if (!user) {
    return (
      <Link
        to="/login"
        className="hover:font-bold hover:cursor-pointer text-white px-4 py-2
                   border border-button bg-button rounded-3xl 
                   hover:bg-button-hover hover:border-button-hover hover:scale-105"
      >
        로그인
      </Link>
    );
  }

  // 로그인 상태: 이름 버튼 + (열렸을 때만) 드롭다운
  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover:font-bold hover:cursor-pointer text-white px-4 py-2
                   border border-button bg-button rounded-3xl 
                   hover:bg-button-hover hover:border-button-hover hover:scale-105"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.login_id}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-36 bg-[#1e293b]
                     border border-white/20 rounded-xl shadow-lg text-sm text-white"
        >
          <Link
            to="/mypage"
            className="block px-4 py-2 hover:bg-[#334155] rounded-t-xl"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            마이페이지
          </Link>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 hover:bg-[#334155] hover:cursor-pointer rounded-b-xl"
            role="menuitem"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
