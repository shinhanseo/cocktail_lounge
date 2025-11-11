// src/components/Search/SearchPosts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function SearchPosts({ keyword }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!keyword) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:4000/api/search/posts", {
          params: { keyword, page: 1, limit: 10 },
        });

        setPosts(res.data.items);
      } catch (err) {
        setError("게시글을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [keyword]);

  if (loading) return <p className="text-gray-400">불러오는 중...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2 text-white">
        📄 “{keyword}” 관련 게시글
      </h3>

      {posts.length === 0 ? (
        <p className="text-gray-400">검색 결과가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => {
            const plainText = stripHtml(p.body);
            const preview =
              plainText.length > 100
                ? plainText.slice(0, 100) + "..."
                : plainText;

            return (
              <li
                key={p.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition hover:cursor-pointer"
                onClick={() => navigate(`/posts/${p.id}`)}
              >
                <h4 className="font-bold text-lg mb-1 text-white">{p.title}</h4>

                {/* 태그 제거한 텍스트만 보여줌 */}
                <p className="text-sm text-gray-300">{preview}</p>

                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                  <span>작성자: {p.login_id}</span>
                  <span>{p.date}</span>
                </div>

                {p.tags && p.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-button text-white text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
