import { useMemo, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import ContentWriting from "./ContentWriting";

export default function CommunityWriting() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ title: "", tags: "" }); // body 제거
  const [bodyHTML, setBodyHTML] = useState(""); // ← 본문 HTML
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const parseTags = (text) =>
    text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

  const previewTags = useMemo(() => parseTags(form.tags), [form.tags]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMsg("");
  };

  const stripTags = (html) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) return setMsg("제목을 입력해주세요.");
    if (!stripTags(bodyHTML)) return setMsg("본문을 입력해주세요.");

    const parsedTags = parseTags(form.tags);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/posts", {
        title: form.title.trim(),
        body: bodyHTML, // ← HTML로 보냄
        tags: parsedTags,
      });

      alert(
        res.status === 201
          ? "게시글이 등록되었습니다!"
          : "등록이 완료되었습니다."
      );
      setForm({ title: "", tags: "" });
      setBodyHTML("");
      navigate("/community");
    } catch (err) {
      console.error(err);
      alert("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen text-white">
      <section className="w-[800px] max-w-[90%] border border-white/10 bg-white/5 rounded-3xl p-10 mt-10">
        <h1 className="text-3xl font-bold text-center mb-8">✏️ 게시글 작성</h1>

        {msg && (
          <div className="text-center text-sm text-red-400 mb-3">{msg}</div>
        )}

        <form
          className="flex flex-col gap-6 text-gray-900"
          onSubmit={handleSubmit}
        >
          {/* 제목 */}
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

          {/* 본문 (TipTap) */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              본문
            </label>
            <ContentWriting
              initialHTML=""
              onChangeHTML={setBodyHTML} // ← 변경 시 HTML 반영
              className="rounded-xl bg-white/90 p-2 text-gray-900 focus-within:ring-2 focus-within:ring-pink-400 text-gray-900"
            />
          </div>

          {/* 태그 */}
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

          {/* 제출 */}
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
