// frontend/src/components/Recipe/AiBartenderChat.jsx
// -------------------------------------------------------------
// 🧪 AI 바텐더 대화 컴포넌트
// (채팅창 그대로 유지 + 상위 컨테이너 박스만 확대 버전)
// -------------------------------------------------------------

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { LoaderCircle, Send, Bot, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";

export default function AiBartenderChat() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const [lastRecipe, setLastRecipe] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openSaveFailModal, setOpenSaveFailModal] = useState(false);
  const [saveFailMsg, setSaveFailMsg] = useState("");

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

    setLastRecipe(null);
    setSaveMessage("");

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

      const recipeFromServer = res.data?.recipe ?? null;
      setLastRecipe(recipeFromServer);

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
      setLastRecipe(null);
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

  const handleSaveRecipe = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (!lastRecipe) return;

    try {
      setSaveLoading(true);
      setSaveMessage("");

      const res = await axios.post(
        "/api/gemeni/save",
        {
          name: lastRecipe.name,
          ingredient: lastRecipe.ingredient,
          step: lastRecipe.step,
          comment: lastRecipe.comment || "",
          base: lastRecipe.ingredient[0].item,
          rawTaste: "",
          rawKeywords: "",
          abv: lastRecipe.abv ?? null,
          image_url: lastRecipe.image_url ?? null,
          imageThumbnail_url: lastRecipe.imageThumbnail_url || null,
        },
        { withCredentials: true }
      );

      if (res.data?.error) {
        const msg = res.data.error;
        setSaveMessage(msg);
        setSaveFailMsg(msg);
        setOpenSaveFailModal(true);
        return;
      }

      const msg =
        res.data?.message || "마이페이지에 레시피가 저장되었습니다. 🍸";
      setSaveMessage(msg);
      setOpenSaveModal(true);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        "레시피 저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
      setSaveMessage(msg);
      setSaveFailMsg(msg);
      setOpenSaveFailModal(true);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      {/* 상위 컨테이너만 확장한 버전 */}
      <section
        className="
          w-[800px] max-w-5xl mx-auto 
          h-[700px]
          px-8 py-5
          rounded-3xl 
          bg-slate-900/80 
          border border-slate-700/60 
          shadow-xl 
          flex flex-col
        "
      >
        {/* 헤더 */}
        <header className="mb-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/60 text-base">
              🍸
            </span>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-white">
                AI 바텐더와 대화하기
              </h2>
              <p className="text-xs text-slate-400">
                예: “진 베이스에 상큼하고 쌉쌀한 칵테일”, “도수 10% 정도로
                부드럽게”
              </p>
            </div>
          </div>
        </header>

        {/* 🔥 채팅 영역 — 절대 건드리지 않음 (아까 스타일 그대로) */}
        <div
          className="
            flex-1 min-h-0 
            rounded-2xl 
            bg-slate-950/60 
            border border-slate-800 
            px-5 py-3 
            overflow-y-auto 
            space-y-2 
            text-[12px]
          "
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} content={m.content} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="
                  max-w-[70%] 
                  rounded-2xl rounded-tl-sm 
                  bg-slate-800/80 
                  border border-slate-700 
                  px-3 py-2 
                  text-[11px] text-slate-200 
                  flex items-center gap-2
                "
              >
                <LoaderCircle className="w-4 h-4 animate-spin" />
                바텐더가 레시피를 고민하는 중이에요...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 입력영역 — 그대로 */}
        <div className="mt-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              className="
                flex-1 
                resize-none 
                rounded-2xl 
                bg-slate-950/70 
                border border-slate-700 
                px-3 py-2 
                text-[12px] text-slate-100 
                placeholder:text-slate-500 
                focus:outline-none focus:ring-2 focus:ring-button focus:border-transparent 
                max-h-28
              "
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="원하는 기주, 맛, 도수, 분위기를 간단히 적어주세요."
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="
                inline-flex items-center justify-center 
                rounded-2xl 
                px-4 py-2.5 
                text-[12px] font-semibold 
                bg-button text-slate-950 
                disabled:opacity-40 disabled:cursor-not-allowed 
                hover:bg-hover-button 
                transition
              "
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

          <p className="mt-1 text-[11px] text-slate-500">
            * AI가 생성한 레시피는 실제 도수와 다를 수 있어요.
          </p>

          {lastRecipe && (
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                이 레시피를 저장해서 마이페이지에 담을 수 있어요.
              </span>
              <button
                type="button"
                onClick={handleSaveRecipe}
                disabled={saveLoading}
                className="
                  ml-2 px-3 py-1.5 
                  rounded-xl text-[11px] font-medium 
                  bg-amber-400 text-slate-950 
                  hover:bg-amber-300 
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {saveLoading ? "저장 중..." : "이 레시피 저장하기"}
              </button>
            </div>
          )}

          {saveMessage && (
            <p className="mt-1 text-[11px] text-emerald-400">{saveMessage}</p>
          )}
        </div>

        {showLoginModal && (
          <LoginRequiredModal
            onClose={() => setShowLoginModal(false)}
            onGoLogin={() => navigate("/login")}
          />
        )}
      </section>

      {/* 저장 성공 모달 */}
      <CommonModal
        open={openSaveModal}
        onClose={() => setOpenSaveModal(false)}
        title="마이페이지 저장완료!"
        message="마이페이지에서 해당 레시피를 확인해보세요!"
        cancelText="닫기"
        confirmText="마이페이지로 이동하기"
        onConfirm={() => {
          setOpenSaveModal(false);
          navigate("/mypage/myaicocktails");
        }}
      />

      {/* 저장 실패 모달 */}
      <CommonModal
        open={openSaveFailModal}
        onClose={() => setOpenSaveFailModal(false)}
        title="저장 실패"
        message={saveFailMsg || "레시피 저장 중 오류가 발생했습니다."}
        cancelText="닫기"
      />
    </>
  );
}

// -------------------------------------------------------------
// 로그인 필요 모달 (그대로)
// -------------------------------------------------------------

function LoginRequiredModal({ onClose, onGoLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-[340px] rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl">
        <h3 className="text-white font-semibold text-base">로그인 필요</h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          AI 바텐더는 로그인한 사용자만 이용할 수 있어요.
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
            className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-button text-slate-950 hover:bg-button-hover transition"
          >
            로그인하기 →
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 말풍선 컴포넌트 (그대로 유지)
// -------------------------------------------------------------

function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          flex items-start gap-2 
          max-w-[70%]
          ${isUser ? "flex-row-reverse" : "flex-row"}
        `}
      >
        <div
          className={`
            w-7 h-7 
            rounded-full 
            flex items-center justify-center 
            text-[11px]
            ${
              isUser
                ? "bg-amber-400 text-slate-950"
                : "bg-slate-800 text-amber-300 border border-slate-700"
            }
          `}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div
          className={`
            px-3.5 py-2.5 
            rounded-2xl 
            text-[12px] whitespace-pre-line leading-snug
            ${
              isUser
                ? "bg-amber-400/90 text-slate-950 rounded-tr-sm"
                : "bg-slate-800/90 text-slate-100 border border-slate-700 rounded-tl-sm"
            }
          `}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
