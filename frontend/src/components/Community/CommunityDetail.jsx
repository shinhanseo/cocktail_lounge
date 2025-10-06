// src/pages/CommunityDetail.jsx
import { useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CommunityDetail() {
  const { id } = useParams(); // URL에서 id 추출
  const [post, setPost] = useState(null); // 게시글 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // 로딩/에러/데이터 상태에 따라 분기 렌더링
  if (loading) return <div className="text-white p-8">불러오는 중...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!post)
    return <div className="text-white p-8">게시글을 찾을 수 없습니다.</div>;

  return (
    <article className="w-full max-w-[960px] border border-white/10 text-white bg-white/5 rounded-2xl mx-auto p-6 mt-12">
      <div className="flex justify-between items-start">
        {/* 왼쪽 영역: 제목, 작성자, 작성일 */}
        <div>
          <NavLink
            to="/community"
            className="text-sm text-white/70 hover:font-bold"
          >
            ← 목록으로
          </NavLink>

          <section className="text-3xl mt-2">{post.title}</section>
          <section className="text-gray-500 text-sm">
            작성자 : {post.user}
          </section>
          <section className="text-gray-500 text-sm">{post.date}</section>
        </div>

        {/* 오른쪽 영역: 태그 */}
        <div>
          <h2 className="text-xl mb-2">태그</h2>
          <ul className="flex gap-2 flex-wrap justify-end">
            {post.tags?.map((tag) => (
              <li
                key={tag}
                className="px-2 py-1 bg-white/10 rounded-full text-sm"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-6 font-bold">{post.body}</div>
    </article>
  );
}
