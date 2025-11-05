// src/pages/CommunityWriting.jsx
// -------------------------------------------------------------
// ✏️ CommunityWriting
// - 커뮤니티 게시글 작성 페이지
// - 제목/본문/태그 입력 → 유효성 검사 → 서버 전송
// - 작성 완료 시 목록(/community)으로 이동
// -------------------------------------------------------------

import { useMemo, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function CommunityWriting() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // --- 폼 상태 (tags는 입력창의 문자열) ---
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 태그 파서 ---
  // 쉼표(,), 공백, # 기준 분리 → 트림 → 빈값 제거 → 최대 10개
  const parseTags = (text) =>
    text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

  // 미리보기용 태그
  const previewTags = useMemo(() => parseTags(form.tags), [form.tags]);

  // --- 입력 변경 핸들러 ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMsg("");
  };

  // --- 제출 핸들러 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const { title, body, tags } = form;

    // 간단한 유효성 검사
    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!body.trim()) return setMsg("본문을 입력해주세요.");

    // 전송용 태그 배열
    const parsedTags = parseTags(tags);

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:4000/api/posts", {
        title: title.trim(),
        body: body.trim(),
        tags: parsedTags,
      });

      if (res.status === 201) {
        alert("게시글이 등록되었습니다!");
        setForm({ title: "", body: "", tags: "" });
        navigate("/community");
      } else {
        // 혹시 200/204 등으로 응답해도 성공 처리
        alert("등록이 완료되었습니다.");
        setForm({ title: "", body: "", tags: "" });
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
      <section className="w-[800px] max-w-[90%] border border-white/10 bg-white/5 rounded-3xl p-10 mt-10">
        <h1 className="text-3xl font-bold text-center mb-8">✏️ 게시글 작성</h1>

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
              name="title"
              type="text"
              value={form.title}
              onChange={onChange}
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
              name="body"
              value={form.body}
              onChange={onChange}
              placeholder="본문을 입력해주세요."
              rows={12}
              className="w-full p-4 rounded-xl bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 resize-none transition-all"
            />
          </div>

          {/* 태그 입력 */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              태그
            </label>
            <input
              name="tags"
              type="text"
              value={form.tags}
              onChange={onChange}
              placeholder="#태그를 입력해 주세요 (쉼표, 공백, # 구분)"
              className="w-full h-[45px] px-4 rounded-xl bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 transition-all"
            />
            {/* 태그 미리보기 */}
            {previewTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {previewTags.map((tag) => (
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
