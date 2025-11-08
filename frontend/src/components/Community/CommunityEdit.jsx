// src/pages/CommunityEdit.jsx
// -------------------------------------------------------------
// ✏️ CommunityEdit (TipTap 버전)
// - 기존 글 불러오기 → TipTap로 수정 → PUT /api/posts/:id
// -------------------------------------------------------------

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import ContentWriting from "./ContentWriting"; // TipTap 컴포넌트

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id } = useParams();

  // --- 폼 상태 (title/tags는 문자열, 본문은 별도의 HTML 상태) ---
  const [form, setForm] = useState({ title: "", tags: "" }); // body 제거
  const [bodyHTML, setBodyHTML] = useState(""); // TipTap HTML
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // --- 태그 파서 ---
  const parseTags = (text) =>
    text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

  const previewTags = useMemo(() => parseTags(form.tags), [form.tags]);

  // --- 기존 데이터 불러오기 ---
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingInit(true);
        const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
        const p = res.data;

        // 작성자만 수정 가능
        if (user && p.user && user.login_id !== p.user) {
          alert("본인 게시글만 수정할 수 있습니다.");
          navigate(`/posts/${id}`);
          return;
        }

        if (alive) {
          setForm({
            title: p.title || "",
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          });
          setBodyHTML(p.body || "");
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

  // --- 입력 핸들러 ---
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

  // --- 제출 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const { title, tags } = form;

    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!stripTags(bodyHTML)) return setMsg("본문을 입력해주세요.");

    const parsedTags = parseTags(tags);

    try {
      setLoading(true);

      // 서버가 body_html을 받는 경우 👇(권장)
      const payload = {
        title: title.trim(),
        body: bodyHTML,
        tags: parsedTags,
      };

      const res = await axios.put(
        `http://localhost:4000/api/posts/${id}`,
        payload
      );

      if (res.status === 200) {
        alert("게시글이 수정되었습니다!");
        navigate(`/posts/${id}`); // 상세로 복귀
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 로딩 상태 ---
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">✏️ 게시글 수정</h1>
          <NavLink
            to={`/posts/${id}`}
            className="text-sm text-white/70 hover:font-bold"
          >
            ← 돌아가기
          </NavLink>
        </div>

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

          {/* 본문 (TipTap) */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              본문
            </label>
            <ContentWriting
              initialHTML={bodyHTML} // ← 초기값 주입
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
              placeholder="#태그를 입력해 주세요 (쉼표, 공백 구분)"
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
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
