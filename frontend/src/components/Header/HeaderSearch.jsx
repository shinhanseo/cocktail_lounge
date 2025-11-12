// src/components/Layout/HeaderSearch.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import search from "@/assets/search.svg";

export default function HeaderSearch() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 form 제출 막기

    const trimmed = keyword.trim();
    if (!trimmed) return; // 빈값이면 리턴

    // 검색 페이지로 이동 (쿼리스트링에 keyword 전달)
    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center relative">
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="오늘의 한잔을 찾아보세요."
        className="w-130 h-10 bg-white rounded-4xl border-2 
                   border-black/50 px-4 pr-10
                   text-gray-900 placeholder-gray-500"
      />

      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
        aria-label="검색"
      >
        <img src={search} alt="검색" className="w-5 h-5 text-gray-500" />
      </button>
    </form>
  );
}
