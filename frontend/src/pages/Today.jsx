// src/pages/Today.jsx (예시)

import { useState } from "react";
import JemeniRecommend from "@/components/Recommend/JemeniRecommend";
import AiBartenderChat from "@/components/Recommend/AiBartenderChat";

export default function Today() {
  const [mode, setMode] = useState("form");

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      {/* 선택 버튼 영역 */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setMode("form")}
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
          onClick={() => setMode("chat")}
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
