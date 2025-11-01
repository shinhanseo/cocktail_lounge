// src/pages/CommunityWriting.jsx
// -------------------------------------------------------------
// ✏️ CommunityWriting
// - 커뮤니티 게시글 작성 페이지
// - 제목/본문/태그 입력 → 유효성 검사 → 서버 전송
// - 작성 완료 시 목록(/community)으로 이동
// -------------------------------------------------------------

import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function CommunityWriting() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // --- 폼 상태 ---
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagText, setTagText] = useState("");
  const [tags, setTags] = useState([]); // 시각화용 태그 리스트
  const [msg, setMsg] = useState(""); // 유효성/에러 메시지
  const [loading, setLoading] = useState(false);

  // --- 태그 파서 ---
  // 쉼표(,), 공백, # 기준으로 분리 → 공백 제거 → 빈값 제거 → 최대 10개
  const parseTags = (text) => {
    return text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);
  };

  // --- 제출 핸들러 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // 간단한 유효성 검사
    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!body.trim()) return setMsg("본문을 입력해주세요.");

    // 태그 파싱 (전송/미리보기 동기화)
    const parsedTags = parseTags(tagText);
    setTags(parsedTags);

    try {
      setLoading(true);

      // 게시글 생성 요청
      const res = await axios.post("http://localhost:4000/api/posts", {
        user_id: user?.id, // 로그인 사용자의 id (백엔드에서 인증 쿠키와 함께 검증 권장)
        title,
        body,
        tags: parsedTags, // 배열 전송
      });

      // 성공 처리
      if (res.status === 201) {
        alert("게시글이 등록되었습니다!");
        setTitle("");
        setBody("");
        setTagText("");
        setTags([]);
        navigate("/community");
      }
    } catch (err) {
      console.error(err);
      alert("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 렌더 ---
  return (
    <main className="flex justify-center items-center min-h-screen text-white">
      <section className="w-[800px] max-w-[90%] border-white/10 text-white bg-white/5 rounded-3xl p-10 mt-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          ✏️ 게시글 작성
        </h1>

        {/* 안내/에러 메시지 */}
        {msg && (
          <div className="text-center text-sm text-red-400 mb-3">{msg}</div>
        )}

        {/* 작성 폼 */}
        <form
          className="flex flex-col gap-6 text-gray-900"
          onSubmit={handleSubmit}
        >
          {/* 제목 입력 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
              className="w-full h-[45px] px-4 rounded-xl bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 transition-all"
            />
          </div>

          {/* 본문 입력 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              본문
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="본문을 입력해주세요."
              className="w-full h-[300px] p-4 rounded-xl bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 resize-none transition-all"
            />
          </div>

          {/* 태그 입력 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              태그
            </label>
            <input
              type="text"
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="#태그를 입력해 주세요 (쉼표, 공백 구분)"
              className="w-full h-[45px] px-4 rounded-xl bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 transition-all"
            />
            {/* 태그 미리보기 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#17BEBB]/20 border border-[#17BEBB]/50 text-[#17BEBB] rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-[200px] h-[50px] rounded-xl text-white font-semibold text-lg shadow-lg transition-transform ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-button hover:scale-105 hover:bg-button-hover"
              }`}
            >
              {loading ? "등록 중..." : "작성 완료"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
