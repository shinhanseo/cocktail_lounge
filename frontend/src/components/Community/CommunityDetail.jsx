// src/pages/CommunityDetail.jsx
// -------------------------------------------------------------
// 📝 CommunityDetail
// - URL 파라미터(id)로 특정 게시글 상세를 조회/표시
// - 로딩/에러/없음 상태 처리
// - 상단 메타(작성자/날짜) + 태그 + 본문 렌더링 + 좋아요 버튼
// - 목록으로 돌아갈 때, 이전 리스트의 page/limit/sort 상태 유지
// -------------------------------------------------------------

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import Comment from "@/components/Comment/Comment";
import PostLikeButton from "@/components/Like/PostLikeButton";
import DOMPurify from "dompurify";

export default function CommunityDetail() {
  // --- URL 파라미터 ---
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation(); // 리스트에서 넘어온 from을 받기 위함

  // --- 상태 ---
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 수정/삭제 ---
  const handleEdit = () => {
    navigate(`/communityedit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/posts/${id}`);
      alert("게시글이 삭제되었습니다.");

      // 삭제 후에도 가능하면 이전 리스트 상태로
      const fallback = "/community";
      const from = location.state?.from || fallback;
      navigate(from);
    } catch (err) {
      console.log(err);
      alert("삭제 도중 오류가 발생했습니다.");
    }
  };

  // --- 목록으로 돌아가기 (page/limit/sort 유지) ---
  const handleBack = () => {
    const fallback = "/community";
    const from = location.state?.from || fallback;
    navigate(from);
  };

  // --- 데이터 불러오기 ---
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

  // --- 상태별 UI ---
  if (loading)
    return (
      <article className="w-full max-w-[960px] mx-auto mt-12 p-8 rounded-2xl bg-white/5 border border-white/10 text-white animate-pulse">
        불러오는 중...
      </article>
    );

  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!post)
    return <div className="text-white p-8">게시글을 찾을 수 없습니다.</div>;

  // --- 상세 렌더 ---
  return (
    <section className="w-full max-w-[960px] mx-auto mt-12 text-white">
      {/* 상단 컨트롤 영역 */}
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

        {/* 목록으로: 리스트에서 넘어온 from이 있으면 그리로, 없으면 /community */}
        <button
          onClick={handleBack}
          className="text-sm text-white/70 hover:font-bold"
        >
          ← 목록으로
        </button>
      </div>

      {/* 게시글 본문 박스 */}
      <article
        className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10
             shadow-[0_6px_20px_rgba(0,0,0,.35)]
             transition-shadow duration-300 backdrop-blur-[2px]"
      >
        {/* 상단: 제목/메타 + 태그 */}
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

          {/* 오른쪽: 태그 */}
          <aside className="md:text-right shrink-0">
            <h2 className="text-base font-semibold mb-2 text-white/80">태그</h2>
            {Array.isArray(post.tags) && post.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2 md:justify-end">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="px-2 py-1 bg-white/10 border border-white/10 rounded-full text-sm
                         hover:bg-white/15 hover:scale-105 transition-transform hover:cursor-pointer"
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

        {/* 구분선 */}
        <div className="my-6 h-px w-full bg-white/20" />

        {/* 본문 */}
        <div
          className="tiptap leading-relaxed text-white/95 mb-6 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.body),
          }}
        />

        {/* 좋아요 버튼 (오른쪽 아래) */}
        <div className="flex justify-end mt-8">
          <PostLikeButton postId={id} />
        </div>
      </article>

      {/* 댓글 영역 */}
      <Comment postId={id} />
    </section>
  );
}
