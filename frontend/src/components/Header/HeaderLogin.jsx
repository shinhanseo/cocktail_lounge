// src/components/HeaderLogin.jsx
// -------------------------------------------------------------
// 👤 HeaderLogin
// - 헤더 우측 로그인/사용자 메뉴 컴포넌트
// - 로그인 여부에 따라 버튼 UI 변경
//   • 비로그인: "로그인" 버튼 표시
//   • 로그인 : 사용자명 + 드롭다운 메뉴 (마이페이지 / 로그아웃)
// - 외부 클릭 시 메뉴 자동 닫힘 처리 포함
// -------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function HeaderLogin() {
  // --- Zustand 전역 상태 ---
  const { user, logout } = useAuthStore();

  // --- 로컬 상태 ---
  const [open, setOpen] = useState(false); // 드롭다운 열림 여부
  const boxRef = useRef(null); // 메뉴 박스 참조 (바깥 클릭 감지용)

  // --- 로그아웃 처리 ---
  const onLogout = async () => {
    try {
      // 백엔드 세션/쿠키 삭제 요청
      await axios.post("http://localhost:4000/api/logout");
    } finally {
      // 전역 스토어에서 사용자 정보 제거
      logout();
      setOpen(false);
    }
  };

  // --- 바깥 클릭 시 메뉴 닫기 ---
  useEffect(() => {
    const handleClick = (e) => {
      // 메뉴 영역 밖 클릭 시 close
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // --- 비로그인 상태 ---
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

  // --- 로그인 상태 ---
  return (
    <div className="relative" ref={boxRef}>
      {/* 사용자 이름 버튼 */}
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

      {/* 드롭다운 메뉴 */}
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-36 bg-[#1e293b]
                     border border-white/20 rounded-xl shadow-lg text-sm text-white"
        >
          {/* 마이페이지 이동 */}
          <Link
            to="/mypage"
            className="block px-4 py-2 hover:bg-[#334155] rounded-t-xl"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            마이페이지
          </Link>

          {/* 로그아웃 버튼 */}
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
