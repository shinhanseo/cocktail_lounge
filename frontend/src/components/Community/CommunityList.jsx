import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CommunityList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/posts");
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
    return <div className="text-white">게시글이 없습니다</div>;

  return (
    <ul>
      {posts.map((p) => (
        <li
          key={p.id}
          className="grid grid-cols-[80px_1fr_140px] sm:grid-cols-[80px_1fr_140px]
                     border-white/10 border-b-4 py-2 items-center hover:bg-white/5"
        >
          <div className="text-center">{p.id}</div>
          <NavLink
            to={`/posts/${p.id}`}
            state={{ posts: p }}
            className="text-left pl-2 truncate hover:font-bold hover:cursor-pointer"
          >
            {p.title}
          </NavLink>
          <div className="text-center">{p.user}</div>
        </li>
      ))}
    </ul>
  );
}
