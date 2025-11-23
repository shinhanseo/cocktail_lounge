// frontend/src/components/Recipe/AiBartenderChat.jsx

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { LoaderCircle, Send, Bot, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function AiBartenderChat() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false); // 비 로그인시 모달 상태 관리

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요, AI 바텐더입니다 🍸\n좋아하는 기주나 맛, 분위기를 알려주시면 어울리는 칵테일 레시피를 같이 만들어볼게요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/gemeni/bartender-chat",
        {
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        { withCredentials: true }
      );

      const reply =
        res.data?.reply ??
        "레시피 서버에서 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "지금은 바텐더가 잠깐 쉬는 중이에요 🥲\n잠시 후 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto rounded-3xl bg-slate-900/70 border border-slate-700/70 shadow-xl px-6 py-5 flex flex-col h-[560px]">
      <header className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/60">
              🍸
            </span>
            AI 바텐더와 대화하기
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            예: “진 베이스에 상큼하고 쌉쌀한 칵테일 만들어줘”, “알콜도수 10%
            정도로 부드럽게”
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 bg-slate-950/40 rounded-2xl border border-slate-800/70 px-4 py-3 overflow-y-auto space-y-3 text-sm">
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} content={m.content} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs text-slate-200 flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              바텐더가 레시피를 고민하는 중이에요...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          className="flex-1 resize-none rounded-2xl bg-slate-950/60 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent max-h-32"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="원하는 기주, 맛, 분위기, 도수 등을 자유롭게 적어주세요."
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-button text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover-button transition"
        >
          {loading ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span className="mr-1">전송</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-2 text-[11px] text-slate-500">
        * 칵테일/술 관련 대화만 가능합니다. AI가 생성한 레시피는 실제 도수와
        다를 수 있으니 참고용으로 사용해 주세요.
      </p>

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onGoLogin={() => navigate("/login")}
        />
      )}
    </section>
  );
}

function LoginRequiredModal({ onClose, onGoLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* dim */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="relative w-[320px] rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl">
        <h3 className="text-white font-semibold text-base">로그인 필요</h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          AI 바텐더는 로그인한 사용자만 이용할 수 있어요.
          <br />
          로그인하고 레시피를 만들어볼까요?
        </p>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/5 text-slate-200 hover:bg-white/10 transition"
          >
            닫기
          </button>
          <button
            onClick={onGoLogin}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-button text-slate-950 hover:bg-button-hover transition hover:cursor-pointer"
          >
            로그인하기 →
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start gap-2 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
            isUser
              ? "bg-amber-400 text-slate-950"
              : "bg-slate-800 text-amber-300 border border-slate-700"
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div
          className={`px-3 py-2 rounded-2xl text-xs whitespace-pre-line leading-relaxed ${
            isUser
              ? "bg-amber-400/90 text-slate-950 rounded-tr-sm"
              : "bg-slate-800/80 text-slate-100 border border-slate-700 rounded-tl-sm"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
