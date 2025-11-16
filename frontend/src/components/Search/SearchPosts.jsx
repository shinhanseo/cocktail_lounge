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
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pageCount: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [page, setPage] = useState(1); // 현재 페이지
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 검색어가 바뀌면 페이지를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    if (!keyword) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:4000/api/search/posts", {
          params: { keyword, page, limit: 5 },
        });

        setPosts(res.data.items);
        setMeta(res.data.meta);
      } catch (err) {
        setError("게시글을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [keyword, page]); // page 바뀔 때마다 다시 호출

  if (loading) return <p className="text-gray-400">불러오는 중...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <p className="text-s font-semibold mb-2 text-white">
        📄 “{keyword}” 관련 게시글 {meta.total}건
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-400">검색 결과가 없습니다.</p>
      ) : (
        <>
          {/* 결과 리스트 */}
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
                  <h4 className="font-bold text-lg mb-1 text-white">
                    {p.title}
                  </h4>

                  <p className="text-sm text-gray-300">{preview}</p>

                  <div className="mt-2 text-xs text-gray-400 flex justify-between">
                    <span>작성자: {p.nickname}</span>
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

          {/* 페이지네이션 영역 */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-300">
            <button
              type="button"
              disabled={!meta.hasPrev}
              onClick={() => meta.hasPrev && setPage((p) => p - 1)}
              className={`px-3 py-1 rounded-full border ${
                meta.hasPrev
                  ? "border-white/50 hover:bg-white/10 hover:cursor-pointer"
                  : "border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              이전
            </button>

            <span>
              {meta.page} / {meta.pageCount} 페이지
            </span>

            <button
              type="button"
              disabled={!meta.hasNext}
              onClick={() => meta.hasNext && setPage((p) => p + 1)}
              className={`px-3 py-1 rounded-full border ${
                meta.hasNext
                  ? "border-white/50 hover:bg-white/10 hover:cursor-pointer"
                  : "border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
