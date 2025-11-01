// frontend/src/components/Community/CommunityPreview.jsx
// -------------------------------------------------------------
// 💬 CommunityPreview
// - 커뮤니티 최신 글(최대 6개)을 불러와 미리보기 목록으로 표시
// - 로딩/에러/빈 목록 상태를 각각 처리
// - 각 항목 클릭 시 게시글 상세(/posts/:id)로 이동
// -------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// 커뮤니티 최신글 5개 미리보기 (요청은 limit=6)
export default function CommunityPreview() {
  // --- 상태 관리 ---
  const [posts, setPosts] = useState([]); // 최신 글 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  // --- 데이터 페치 ---
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        // 최신 글 조회 (limit=6) — 서버에서 최신순으로 반환된다고 가정
        const res = await axios.get("http://localhost:4000/api/posts/latest", {
          params: { limit: 6 },
        });

        // 방어 코드: 배열일 때만 적용
        setPosts(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        // 요청 취소 이외의 에러만 표시
        if (err.name !== "CanceledError") {
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  // --- 상태별 UI ---
  if (loading) return <div className="text-white">불러오는 중...</div>;

  if (error) return <div className="text-red-400">{error}</div>;

  // 빈 목록 UI
  if (posts.length === 0)
    return (
      <section
        className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
           shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
           transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">💬 커뮤니티 최신글</h2>
          <NavLink
            to="/community"
            className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
          >
            더보기 →
          </NavLink>
        </div>

        {/* 비어 있을 때의 안내 카드 */}
        <div className="flex gap-6 justify-center mt-24">
          <div className="bg-white/10 rounded-2xl p-4 w-[200px] hover:scale-105 transition-all text-center">
            작성된 글이 없습니다.
          </div>
        </div>
      </section>
    );

  // --- 목록 UI ---
  let num = 0; // 순번 표기용 (1부터 증가)
  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
                 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
                 transition-shadow duration-300"
    >
      {/* 헤더: 섹션 제목 + 더보기 링크 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">💬 커뮤니티 최신글</h2>
        <NavLink
          to="/community"
          className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
        >
          더보기 →
        </NavLink>
      </div>

      {/* 최신글 리스트 */}
      <ul>
        {posts.map((p) => (
          <li
            key={p.id}
            className="py-2 flex items-center gap-3 hover:bg-white/5 hover:rounded-2xl border-b-2 border-white/10"
          >
            {/* 순번 (1부터) */}
            <span className="text-white/50 w-10 text-center">{++num}</span>

            {/* 제목: 15자 초과 시 ... 처리 */}
            <NavLink
              to={`/posts/${p.id}`}
              state={{ posts: p }}
              className="flex-1 hover:cursor-pointer hover:font-bold"
              title={p.title}
            >
              {p.title.length > 15 ? p.title.slice(0, 15) + "..." : p.title}
            </NavLink>

            {/* 작성자 (오른쪽 정렬) */}
            <span className="text-white/70 text-sm w-[90px] text-right">
              {p.user}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
