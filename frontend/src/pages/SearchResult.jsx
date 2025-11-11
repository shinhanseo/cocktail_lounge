// src/pages/SearchResult.jsx
import { useLocation } from "react-router-dom";
import { useState } from "react";
import SearchPosts from "@/components/Search/SearchPosts";
import SearchCocktails from "@/components/Search/SearchCocktails";

export default function SearchResult() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const keyword = params.get("keyword") || "";

  const [tab, setTab] = useState("posts"); // "posts" | "cocktails"

  return (
    <div className="px-6 py-10 text-white min-h-screen w-[800px]">
      {/* 상단 제목 */}
      <h2 className="text-2xl font-bold mb-2">🔍 “{keyword}” 검색 결과</h2>

      {/* 탭 영역 */}
      <div className="flex gap-6 mb-6 border-b border-white/20 mt-4z`">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`pb-2 text-base font-semibold transition-colors hover:cursor-pointer ${
            tab === "posts"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          게시글
        </button>
        <button
          type="button"
          onClick={() => setTab("cocktails")}
          className={`pb-2 text-base font-semibold transition-colors hover:cursor-pointer ${
            tab === "cocktails"
              ? "border-b-2 border-white text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          칵테일
        </button>
      </div>

      {/* 결과 영역 */}
      <div className="mt-4">
        {tab === "posts" ? (
          <div className="text-gray-300">
            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <SearchPosts keyword={keyword} />
            </div>
          </div>
        ) : (
          <div className="text-gray-300">
            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <SearchCocktails keyword={keyword} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
