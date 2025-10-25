import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HeaderLogin() {
  const user = "imkara";
  const [login, setLogin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    //setLogin(true);
  }, []);

  if (!login) {
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

  return (
    <div className="relative">
      {/* 프로필 이름 (클릭 시 메뉴 열기) */}
      <button
        onClick={() => setOpen(!open)}
        className="hover:font-bold hover:cursor-pointer text-white px-4 py-2
                   border border-button bg-button rounded-3xl 
                   hover:bg-button-hover hover:border-button-hover hover:scale-105"
      >
        imkara
      </button>

      {/* 드롭다운 메뉴 */}
      {open && (
        <div
          className="absolute top-full mb-2 right-0 w-32 bg-[#1e293b] border border-white/20 rounded-xl
                     shadow-lg text-sm text-white animate-fadeIn mt-4"
        >
          <Link
            to="/mypage"
            className="block px-4 py-2 hover:bg-[#334155] rounded-t-xl"
          >
            마이페이지
          </Link>
          <button
            onClick={() => setLogin(false)}
            className="block w-full text-left px-4 py-2 hover:bg-[#334155] rounded-b-xl"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
