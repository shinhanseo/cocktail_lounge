// src/pages/Today.jsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JemeniRecommend from "@/components/Recommend/JemeniRecommend";
import AiBartenderChat from "@/components/Recommend/AiBartenderChat";

export default function Today() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "form";

  const [mode, setMode] = useState(initialMode);

  // URL이 바뀌면 모드도 바뀌도록
  useEffect(() => {
    const newMode = searchParams.get("mode") || "form";
    setMode(newMode);
  }, [searchParams]);

  const handleModeChange = (newMode) => {
    setSearchParams({ mode: newMode });
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      {/* 선택 버튼 영역 */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => handleModeChange("form")}
          className={`px-4 py-2 rounded-2xl text-sm font-medium border transition hover:cursor-pointer
            ${
              mode === "form"
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-900/70 text-slate-200 border-slate-700 hover:bg-slate-800"
            }`}
        >
          📋 입력해서 레시피 받기
        </button>

        <button
          onClick={() => handleModeChange("chat")}
          className={`px-4 py-2 rounded-2xl text-sm font-medium border transition hover:cursor-pointer
            ${
              mode === "chat"
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-900/70 text-slate-200 border-slate-700 hover:bg-slate-800"
            }`}
        >
          🍸 바텐더와 대화하며 만들기
        </button>
      </div>

      {/* 내용 영역 */}
      <div>{mode === "form" ? <JemeniRecommend /> : <AiBartenderChat />}</div>
    </div>
  );
}
