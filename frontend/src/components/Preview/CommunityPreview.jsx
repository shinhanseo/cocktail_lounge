import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

//커뮤니티 최신글 5개 미리보기
export default function CommunityPreview() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/posts/latest", {
          params: { limit: 6 },
        });
        setPosts(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, []);

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
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
        <div className="flex gap-6 justify-center mt-24">
          <div className="bg-white/10 rounded-2xl p-4 w-[200px] hover:scale-105 transition-all text-center">
            작성된 글이 없습니다.
          </div>
        </div>
      </section>
    );

  let num = 0;
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

      <ul>
        {posts.map((p) => (
          <li
            key={p.id}
            className="py-2 flex items-center gap-3 hover:bg-white/5 hover:rounded-2xl border-b-2 border-white/10"
          >
            <span className="text-white/50 w-10 text-center">{++num}</span>
            <NavLink
              key={p.id}
              to={`/posts/${p.id}`}
              state={{ posts: p }}
              className="flex-1 hover:cursor-pointer hover:font-bold"
              title={p.title}
            >
              {/* 15자 이상 ...으로 대체 */}
              {p.title.length > 15 ? p.title.slice(0, 15) + "..." : p.title}
            </NavLink>
            <span className="text-white/70 text-sm w-[90px] text-right">
              {p.user}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
