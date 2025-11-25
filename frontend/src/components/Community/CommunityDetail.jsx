// src/pages/CommunityDetail.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import Comment from "@/components/Comment/Comment";
import PostLikeButton from "@/components/Like/PostLikeButton";
import DOMPurify from "dompurify";
import CommonModal from "@/components/CommonModal";

export default function CommunityDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 삭제 확인 / 완료 모달 상태
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeleteDone, setOpenDeleteDone] = useState(false);

  const handleEdit = () => {
    navigate(`/communityedit/${id}`);
  };

  const doDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/posts/${id}`);
      setOpenDeleteConfirm(false);
      setOpenDeleteDone(true); //  제 완료 모달 오픈
    } catch (err) {
      console.log(err);
      setOpenDeleteConfirm(false);
      setError("삭제 도중 오류가 발생했습니다.");
    }
  };

  const handleDelete = () => {
    setOpenDeleteConfirm(true);
  };

  const handleBack = () => {
    const fallback = "/community";
    const from = location.state?.from || fallback;
    navigate(from);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
        setPost(res.data);
      } catch {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading)
    return (
      <article className="w-full max-w-[960px] mx-auto mt-12 p-8 rounded-2xl bg-white/5 border border-white/10 text-white animate-pulse">
        불러오는 중...
      </article>
    );

  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!post)
    return <div className="text-white p-8">게시글을 찾을 수 없습니다.</div>;

  return (
    <section className="w-full max-w-[960px] mx-auto mt-12 text-white">
      <div className="flex justify-between items-center mb-3">
        {user?.nickname === post.user ? (
          <div>
            <button
              className="bg-button hover:bg-button-hover px-3 py-1 rounded-lg text-white hover:scale-105 hover:cursor-pointer"
              onClick={handleEdit}
            >
              수정
            </button>
            <button
              className="bg-white/50 hover:bg-white/30 px-3 py-1 rounded-lg text-white hover:scale-105 hover:cursor-pointer ml-2"
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={handleBack}
          className="text-sm text-white/70 hover:font-bold hover:cursor-pointer"
        >
          ← 목록으로
        </button>
      </div>

      <article
        className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10
             shadow-[0_6px_20px_rgba(0,0,0,.35)]
             transition-shadow duration-300 backdrop-blur-[2px]"
      >
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight break-words">
              {post.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                작성자 · {post.user}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                {post.date}
              </span>
            </div>
          </div>

          <aside className="md:text-right shrink-0">
            <h2 className="text-base font-semibold mb-2 text-white/80">태그</h2>
            {Array.isArray(post.tags) && post.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2 md:justify-end">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/40 text-xs text-cyan-200 hover:scale-105 transition-transform hover:cursor-pointer"
                    onClick={() => navigate(`/search?keyword=${tag}`)}
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 text-sm">태그 없음</p>
            )}
          </aside>
        </header>

        <div className="my-6 h-px w-full bg-white/20" />

        <div
          className="tiptap leading-relaxed text-white/95 mb-6 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.body),
          }}
        />

        <div className="flex justify-end mt-8">
          <PostLikeButton postId={id} />
        </div>
      </article>

      <Comment postId={id} />

      {/*  1) 삭제 확인 모달 */}
      <CommonModal
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        title="정말 삭제하시겠습니까?"
        message="삭제하면 되돌릴 수 없습니다."
        cancelText="취소"
        confirmText="삭제"
        confirmVariant="danger"
        onConfirm={doDelete}
      />

      {/*  2) 삭제 완료 모달 */}
      <CommonModal
        open={openDeleteDone}
        onClose={() => {
          setOpenDeleteDone(false);
          handleBack(); //  닫으면 목록으로 이동
        }}
        title="삭제 완료!"
        message="게시글이 삭제되었습니다."
        cancelText="목록으로"
        // confirmText 없으면 버튼 1개짜리 알림 모달 됨
      />
    </section>
  );
}
