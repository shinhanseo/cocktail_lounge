import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BookmarkCheck } from "lucide-react";

export default function MyBars() {
  const navigate = useNavigate();

  // 상태 관리
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 북마크 목록 불러오기
  const fetchMyBars = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:4000/api/bars/mybars", {
        params: { page, limit: 6 },
        withCredentials: true,
      });

      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setMeta(res.data?.meta ?? { page: 1, pageCount: 1 });
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("로그인이 필요합니다.");
      } else {
        setError("북마크 목록을 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 첫 로드 시 실행
  useEffect(() => {
    fetchMyBars(1);
  }, []);

  // 페이지 이동
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.pageCount) {
      fetchMyBars(newPage);
    }
  };

  // --- 상태별 UI ---
  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  // --- 메인 렌더 ---
  return (
    <div className="w-full flex justify-center">
      <div className="text-white bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg w-[760px]">
        <h2 className="text-xl font-semibold mb-6 border-b border-white/20 pb-3">
          <span className="flex">
            북마크한 Bar 목록
            <BookmarkCheck className="h-8 text-yellow-400 ml-6" />
          </span>
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            아직 북마크한 바가 없습니다.
          </p>
        ) : (
          <>
            {/* --- 목록 --- */}
            <ul className="space-y-3">
              {items.map((it) => {
                const bar = it.bar || {};
                const date = it.bookmarked_at
                  ? new Date(it.bookmarked_at).toISOString().slice(0, 10)
                  : "";

                return (
                  <li
                    key={it.bookmark_id}
                    className="flex justify-between items-center border-b border-white/10 pb-3 hover:bg-white/5 rounded-lg px-4 py-2 transition"
                  >
                    {/* 좌측: 바 정보 */}
                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/bars/${bar.city}`)}
                      title={`${bar.name} (${bar.city})`}
                    >
                      <h3 className="text-lg font-semibold truncate">
                        {bar.name}
                        <span className="ml-2 text-sm text-white/60">
                          · {bar.city}
                        </span>
                      </h3>
                      {bar.desc && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {bar.desc}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* --- 페이지네이션 --- */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                이전
              </button>
              <span className="text-sm text-white/70">
                {meta.page} / {meta.pageCount}
              </span>
              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.pageCount}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
