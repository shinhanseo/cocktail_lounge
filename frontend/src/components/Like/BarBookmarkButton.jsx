import { useState, useEffect } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function BarBookmarkButton({ id }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 마운트 시 초기 상태 로드
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/bars/${id}/bookmark`
        );
        setBookmarked(res.data.bookmarked);
      } catch (err) {
        if (err?.response?.status === 401) {
          // 로그인 안한 유저는 그냥 false로 유지
          setBookmarked(false);
        } else {
          console.error("북마크 상태 불러오기 실패:", err);
        }
      }
    };
    fetchBookmarkStatus();
  }, [id]);

  // 토글 함수
  const toggleBookmark = async () => {
    if (loading) return; // 중복 방지
    setLoading(true);

    try {
      if (bookmarked) {
        await axios.delete(`http://localhost:4000/api/bars/${id}/bookmark`);
        setBookmarked(false);
      } else {
        await axios.post(`http://localhost:4000/api/bars/${id}/bookmark`);
        setBookmarked(true);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("북마크 처리 중 오류가 발생했습니다.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={loading}
      className={`p-2 rounded-xl border transition ml-2 shrink-0 ${
        bookmarked
          ? "border-yellow-400/60 bg-yellow-400/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={bookmarked ? "북마크 제거" : "북마크 추가"}
      title={bookmarked ? "북마크됨" : "북마크"}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-5 h-5 text-yellow-400 hover:cursor-pointer" />
      ) : (
        <Bookmark className="w-5 h-5 text-white/80 hover:cursor-pointer" />
      )}
    </button>
  );
}
