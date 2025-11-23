// src/components/Layout/HeaderSearch.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import search from "@/assets/search.svg";

export default function HeaderSearch() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="오늘의 한잔을 찾아보세요."
        className="
          w-96 h-11                            
          bg-white/90 text-slate-900          
          border border-white/40
          rounded-3xl
          px-4 pr-11
          placeholder:text-slate-500
          shadow-sm

          focus:outline-none
          focus:ring-2 focus:ring-amber-300/70
          focus:border-transparent
          transition
        "
      />

      <button
        type="submit"
        className="
          absolute right-4 top-1/2 -translate-y-1/2
          p-1 rounded-full
          hover:bg-black/10
          transition
        "
        aria-label="검색"
      >
        <img src={search} alt="검색" className="w-5 h-5 opacity-70" />
      </button>
    </form>
  );
}
