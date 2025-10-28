import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
export default function CommunityWriting() {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagText, setTagText] = useState("");
  const [tags, setTags] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 태그 자동 분리: 쉼표, 공백, # 로 split
  const parseTags = (text) => {
    return text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10); // 최대 10개
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!body.trim()) return setMsg("본문을 입력해주세요.");

    const parsedTags = parseTags(tagText);
    setTags(parsedTags);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/posts", {
        user_id: user?.id,
        title,
        body,
        tags: parsedTags, // 배열로 전송됨
      });

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

  return (
    <main className="flex justify-center items-center min-h-screen text-white">
      <section className="w-[800px] max-w-[90%] border-white/10 text-white bg-white/5 rounded-3xl p-10 mt-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          ✏️ 게시글 작성
        </h1>

        {msg && (
          <div className="text-center text-sm text-red-400 mb-3">{msg}</div>
        )}

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
            ></textarea>
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

          {/* 버튼 */}
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
