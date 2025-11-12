// src/components/Like/BarBookmarkButton.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function BarBookmarkButton({ id, onDelta }) {
  const user = useAuthStore((s) => s.user);
  const isLogined = !!user;
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(false); // 내가 북마크했는지
  const [count, setCount] = useState(0); // 총 북마크 수
  const [loading, setLoading] = useState(false);

  // 초기 상태 불러오기 (카운트 + 내가 눌렀는지)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/bars/${id}/bookmark`,
          {
            withCredentials: true,
          }
        );
        setBookmarked(Boolean(res.data?.bookmarked));
        setCount(Number(res.data?.total_bookmark ?? 0));
      } catch (err) {
        // 비로그인(401)이어도 총 개수만 내려주도록 서버 구현한 경우엔 여기 안탐.
        // 만약 401이 떨어지면 로그인 유도 없이 카운트 0 유지.
        if (err?.response?.status !== 401) {
          console.error("북마크 상태 불러오기 실패:", err);
        }
      }
    };
    if (id) fetchStatus();
  }, [id]);

  // 토글
  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (bookmarked) {
        // 이미 북마크 → 취소
        await axios.delete(`http://localhost:4000/api/bars/${id}/bookmark`, {
          withCredentials: true,
        });
        setBookmarked(false);
        setCount((p) => Math.max(0, p - 1));
        onDelta?.(-1);
      } else {
        // 미북마크 → 추가
        await axios.post(
          `http://localhost:4000/api/bars/${id}/bookmark`,
          null,
          {
            withCredentials: true,
          }
        );
        setBookmarked(true);
        setCount((p) => p + 1);
        onDelta?.(+1);
      }
    } catch (err) {
      if (!isLogined || err?.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        console.error(err);
        alert("북마크 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-2 rounded-xl border transition flex items-center gap-2 shrink-0
        ${
          bookmarked
            ? "border-yellow-400/60 bg-yellow-400/10"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={bookmarked ? "북마크 제거" : "북마크 추가"}
      title={bookmarked ? "북마크됨" : "북마크"}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-5 h-5 text-yellow-400" />
      ) : (
        <Bookmark className="w-5 h-5 text-white/80" />
      )}
      <span className="text-sm text-white/90">{count}</span>
    </button>
  );
}
