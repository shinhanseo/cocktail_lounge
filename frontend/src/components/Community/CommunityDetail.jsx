// src/pages/CommunityDetail.jsx
// -------------------------------------------------------------
// 📝 CommunityDetail
// - URL 파라미터(id)로 특정 게시글 상세를 조회/표시
// - 로딩/에러/없음 상태 처리
// - 상단 메타(작성자/날짜) + 태그 + 본문 렌더링
// -------------------------------------------------------------

import { useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CommunityDetail() {
  // --- URL 파라미터 ---
  const { id } = useParams();

  // --- 상태 ---
  const [post, setPost] = useState(null); // 게시글 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 데이터 불러오기 ---
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        // 단건 조회
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
    <article
      className="w-full max-w-[960px] mx-auto mt-12 p-8 md:p-10
                 rounded-2xl bg-white/5 border border-white/10 text-white
                 shadow-[0_6px_20px_rgba(0,0,0,.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,.45)]
                 transition-shadow duration-300 backdrop-blur-[2px]"
    >
      {/* 상단: 좌(타이틀/메타) | 우(태그) */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* --- 왼쪽: 제목/메타 --- */}
        <div className="min-w-0">
          <NavLink
            to="/community"
            className="text-sm text-white/70 hover:font-bold"
          >
            ← 목록으로
          </NavLink>

          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight break-words">
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

        {/* --- 오른쪽: 태그 --- */}
        <aside className="md:text-right">
          <h2 className="text-base font-semibold mb-2 text-white/80">태그</h2>
          <ul className="flex flex-wrap gap-2 md:justify-end">
            {post.tags?.map((tag) => (
              <li
                key={tag}
                className="px-2 py-1 bg-white/10 border border-white/10 rounded-full text-sm
                           hover:bg-white/15 hover:scale-105 transition-transform hover:cursor-pointer"
              >
                #{tag}
              </li>
            )) || <li className="text-white/50 text-sm">태그 없음</li>}
          </ul>
        </aside>
      </div>

      {/* 구분선 */}
      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* 본문 */}
      <div className="leading-relaxed text-white/95">{post.body}</div>
    </article>
  );
}
