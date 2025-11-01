// src/components/Layout/HeaderSearch.jsx
// -------------------------------------------------------------
// 🔍 HeaderSearch
// - 헤더 상단의 검색 입력창 컴포넌트
// - 사용자가 칵테일/바/레시피 등을 검색할 때 사용
// - 돋보기 아이콘 버튼 클릭 시 폼 제출 이벤트 발생
// -------------------------------------------------------------

import search from "@/assets/search.svg";

export default function HeaderSearch() {
  return (
    <form className="flex justify-center relative">
      {/* --- 검색 입력창 --- */}
      <input
        type="search"
        placeholder="오늘의 한잔을 찾아보세요."
        className="w-150 h-10 bg-white rounded-4xl border-2 
                   border-black/50 px-4 pr-10
                   text-gray-900 placeholder-gray-500"
      />

      {/* --- 검색 버튼 (돋보기 아이콘) --- */}
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
