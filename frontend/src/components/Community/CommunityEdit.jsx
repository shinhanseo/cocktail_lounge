// src/pages/CommunityEdit.jsx
// -------------------------------------------------------------
// ✏️ CommunityEdit
// - 커뮤니티 게시글 수정 페이지
// - 기존 글 불러오기 → 수정 → PUT /api/posts/:id
// -------------------------------------------------------------

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate, useParams, NavLink } from "react-router-dom";

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id } = useParams();

  // --- 폼 상태 ---
  const [form, setForm] = useState({ title: "", body: "", tags: "" }); // tags는 입력창 문자열
  const [msg, setMsg] = useState(""); // 유효성/에러 메시지
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // --- 태그 파서 ---
  const parseTags = (text) =>
    text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

  // 미리보기용 태그 배열
  const previewTags = useMemo(() => parseTags(form.tags), [form.tags]);

  // --- 기존 데이터 불러오기 ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingInit(true);
        const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
        const p = res.data;

        if (user && p.user && user.login_id !== p.user) {
          alert("본인 게시글만 수정할 수 있습니다.");
          navigate(`/community/${id}`);
          return;
        }

        if (alive) {
          setForm({
            title: p.title || "",
            body: p.body || "",
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          });
        }
      } catch (e) {
        console.error(e);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
        navigate("/community");
      } finally {
        if (alive) setLoadingInit(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, navigate, user]);

  // --- 핸들러 ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const { title, body, tags } = form;

    // 간단한 유효성 검사
    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!body.trim()) return setMsg("본문을 입력해주세요.");

    const parsedTags = parseTags(tags);

    try {
      setLoading(true);

      // 수정 요청
      const res = await axios.put(`http://localhost:4000/api/posts/${id}`, {
        title: title.trim(),
        body: body.trim(),
        tags: parsedTags, // 배열로 보냄
      });

      if (res.status === 200) {
        alert("게시글이 수정되었습니다!");
        navigate(`/posts/${id}`);
      }
    } catch (err) {
      console.error(err);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <main className="flex justify-center items-center min-h-screen text-white">
        <div className="animate-pulse">불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className="flex justify-center min-h-screen text-white">
      <section className="w-[800px] max-w-[90%] border border-white/10 bg-white/5 rounded-3xl p-10 mt-10">
        {/* 상단 컨트롤 */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          ✏️ 게시글 수정
        </h1>

        {/* 안내/에러 메시지 */}
        {msg && (
          <div className="text-center text-sm text-red-400 mb-3">{msg}</div>
        )}

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 text-gray-900"
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

          {/* 본문 */}
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
              placeholder="#태그를 입력해 주세요 (쉼표, 공백 구분)"
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
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
