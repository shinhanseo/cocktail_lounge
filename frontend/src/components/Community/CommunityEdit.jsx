import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import ContentWriting from "./ContentWriting";
import CommonModal from "@/components/CommonModal";
import api from "@/lib/api";

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id } = useParams();

  const [form, setForm] = useState({ title: "", tags: "" });
  const [bodyHTML, setBodyHTML] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // 모달 상태들
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [openLoadFailModal, setOpenLoadFailModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openFailModal, setOpenFailModal] = useState(false);

  const parseTags = (text) =>
    text
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

  const previewTags = useMemo(() => parseTags(form.tags), [form.tags]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingInit(true);
        const res = await api.get(`/api/posts/${id}`);
        const p = res.data;

        if (user && p.user && user.nickname !== p.user) {
          setOpenForbiddenModal(true);
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
        setOpenLoadFailModal(true);
      } finally {
        if (alive) setLoadingInit(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, navigate, user]);

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

    const { title, tags } = form;

    if (!title.trim()) return setMsg("제목을 입력해주세요.");
    if (!stripTags(bodyHTML)) return setMsg("본문을 입력해주세요.");

    const parsedTags = parseTags(tags);

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        body: bodyHTML,
        tags: parsedTags,
      };

      const res = await api.put(`/api/posts/${id}`, payload);

      if (res.status === 200) {
        setOpenSuccessModal(true);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setOpenFailModal(true);
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">✏️ 게시글 수정</h1>
          <NavLink
            to={`/community/${id}`}
            className="text-sm text-white/70 hover:font-bold"
          >
            ← 돌아가기
          </NavLink>
        </div>

        {msg && (
          <div className="text-center text-sm text-red-400 mb-3">{msg}</div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 text-gray-900"
        >
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

          <div>
            <label className="block text-white text-sm font-semibold mb-2 text-left">
              본문
            </label>
            <ContentWriting
              initialHTML={bodyHTML}
              onChangeHTML={setBodyHTML}
              className="rounded-xl bg-white/90 p-2 text-gray-900 focus-within:ring-2 focus-within:ring-pink-400 text-gray-900"
            />
          </div>

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

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-[200px] h-[50px] rounded-xl text-white font-semibold text-lg shadow-lg transition-transform hover:cursor-pointer ${
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

      {/* 1) 본인글 아니면 수정 불가 모달 */}
      <CommonModal
        open={openForbiddenModal}
        onClose={() => {
          setOpenForbiddenModal(false);
          navigate(`/community/${id}`);
        }}
        title="수정할 수 없습니다"
        message="본인 게시글만 수정할 수 있어요."
        cancelText="확인"
      />

      {/* 2) 게시글 로딩 실패 모달 */}
      <CommonModal
        open={openLoadFailModal}
        onClose={() => {
          setOpenLoadFailModal(false);
          navigate("/community");
        }}
        title="불러오기 실패"
        message="게시글을 불러오는 중 오류가 발생했습니다."
        cancelText="목록으로"
      />

      {/* 3) 수정 성공 모달 */}
      <CommonModal
        open={openSuccessModal}
        onClose={() => {
          setOpenSuccessModal(false);
          navigate(`/community/${id}`);
        }}
        title="수정 완료!"
        message="게시글이 수정되었습니다."
        cancelText="확인"
      />

      {/* 4) 수정 실패 모달 */}
      <CommonModal
        open={openFailModal}
        onClose={() => setOpenFailModal(false)}
        title="수정 실패"
        message="게시글 수정 중 오류가 발생했습니다."
        cancelText="닫기"
      />
    </main>
  );
}
