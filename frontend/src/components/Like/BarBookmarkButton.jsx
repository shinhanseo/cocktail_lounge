// src/components/Like/BarBookmarkButton.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import CommonModal from "@/components/CommonModal";

export default function BarBookmarkButton({ id, onDelta }) {
  const user = useAuthStore((s) => s.user);
  const isLogined = !!user;
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/bars/${id}/bookmark`,
          { withCredentials: true }
        );
        setBookmarked(Boolean(res.data?.bookmarked));
        setCount(Number(res.data?.total_bookmark ?? 0));
      } catch (err) {
        if (err?.response?.status !== 401) {
          console.error("북마크 상태 불러오기 실패:", err);
        }
      }
    };
    if (id) fetchStatus();
  }, [id]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (bookmarked) {
        await axios.delete(`http://localhost:4000/api/bars/${id}/bookmark`, {
          withCredentials: true,
        });
        setBookmarked(false);
        setCount((p) => Math.max(0, p - 1));
        onDelta?.(-1);
      } else {
        await axios.post(
          `http://localhost:4000/api/bars/${id}/bookmark`,
          null,
          { withCredentials: true }
        );
        setBookmarked(true);
        setCount((p) => p + 1);
        onDelta?.(+1);
      }
    } catch (err) {
      if (!isLogined || err?.response?.status === 401) {
        setOpenLoginModal(true);
      } else {
        console.error(err);
        setErrorMsg(
          err?.response?.data?.error || "북마크 처리 중 오류가 발생했습니다."
        );
        setOpenErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-2 rounded-xl border transition flex items-center gap-2 shrink-0 hover:cursor-pointer
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

      {/* 로그인 필요 모달 */}
      <CommonModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        title="로그인이 필요합니다"
        message="북마크는 로그인한 사용자만 이용할 수 있어요."
        cancelText="닫기"
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setOpenLoginModal(false);
          navigate("/login");
        }}
      />

      {/* 일반 오류 모달 */}
      <CommonModal
        open={openErrorModal}
        onClose={() => setOpenErrorModal(false)}
        title="오류 발생"
        message={errorMsg}
        cancelText="닫기"
      />
    </>
  );
}
