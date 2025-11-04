import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/posts/mypost", {
          withCredentials: true,
        });
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error(" 내 게시글 불러오기 실패:", err);
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-10">게시글 불러오는 중...</div>
    );
  if (error)
    return <div className="text-red-400 text-center mt-10">{error}</div>;

  return (
    <div className="text-white bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 border-b border-white/20 pb-3">
        내가 쓴 게시글
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center">
          아직 작성한 게시글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li
              key={p.id}
              onClick={() => navigate(`/posts/${p.id}`)}
              className="flex gap-12 justify-between items-center border-b border-white/10 pb-3 hover:bg-white/5 hover:cursor-pointer rounded-lg px-3 py-2 transition"
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-gray-400 text-sm">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
