// src/pages/Today.jsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JemeniRecommend from "@/components/Recommend/JemeniRecommend";
import AiBartenderChat from "@/components/Recommend/AiBartenderChat";

export default function Today() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "form";
  const [mode, setMode] = useState(initialMode);

  // URL 변경 시 모드 동기화
  useEffect(() => {
    const newMode = searchParams.get("mode") || "form";
    setMode(newMode);
  }, [searchParams]);

  const handleModeChange = (newMode) => {
    setSearchParams({ mode: newMode });
  };

  return (
    <div className="mt-4">
      {/* 메인 컨테이너: 항상 중앙 */}
      <div className="relative max-w-5xl mx-auto px-3">
        {/* 메인 내용 */}
        <div>{mode === "form" ? <JemeniRecommend /> : <AiBartenderChat />}</div>
        <div
          className="
            hidden md:block
            absolute top-10 -right-45
          "
        >
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/70 px-3 py-3 flex flex-col gap-2 shadow-lg">
            <button
              onClick={() => handleModeChange("form")}
              className={`
                w-full px-3 py-2 rounded-xl text-xs font-medium border text-left transition hover:cursor-pointer
                ${
                  mode === "form"
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                    : "bg-slate-950/70 text-slate-100 border-slate-700 hover:bg-slate-800"
                }
              `}
            >
              📋 키워드 입력
            </button>

            <button
              onClick={() => handleModeChange("chat")}
              className={`
                w-full px-3 py-2 rounded-xl text-xs font-medium border text-left transition hover:cursor-pointer
                ${
                  mode === "chat"
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                    : "bg-slate-950/70 text-slate-100 border-slate-700 hover:bg-slate-800"
                }
              `}
            >
              🍸 바텐더와 대화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
