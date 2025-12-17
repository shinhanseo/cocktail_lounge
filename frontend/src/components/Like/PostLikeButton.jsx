import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import api from "@/lib/api";

export default function Like({ postId }) {
  const user = useAuthStore((s) => s.user);
  const isLogined = !!user;
  const [liked, setLiked] = useState(false); // 좋아요 눌렀는지 여부
  const [likes, setLikes] = useState(0); // 좋아요 총 개수
  const navigate = useNavigate();

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 초기 상태 불러오기 (카운트 + 내가 눌렀는지)
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await api.get(`/api/posts/${postId}/like`);
        setLiked(res.data.liked);
        setLikes(res.data.like_count);
      } catch (err) {
        console.error("좋아요 상태 불러오기 실패:", err);
      }
    };
    fetchLikeStatus();
  }, [postId]);

  // 좋아요 토글 함수
  const handleLike = async () => {
    try {
      if (liked) {
        // 이미 눌렀으면 → 취소
        await api.delete(`/api/posts/${postId}/like`);
        setLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        // 안 눌렀으면 → 좋아요
        await api.post(`/api/posts/${postId}/like`);
        setLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (err) {
      if (!isLogined || err?.response?.status === 401) {
        setOpenLoginModal(true);
        return;
      }
      console.log(err);
      setErrorMsg(
        err?.response?.data?.error || "좋아요 처리 중 오류가 발생했습니다."
      );
      setOpenErrorModal(true);
    }
  };

  return (
    <div>
      <button
        onClick={handleLike}
        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 active:scale-95 hover:cursor-pointer bg-white/10 hover:bg-white/20 
          ${liked ? "border border-rose-500" : "text-white"}`}
      >
        {/* 하트 아이콘 (빈/찬 하트 교체) */}
        <span className="text-sm">{liked ? "❤️" : "🤍"}</span>
        <span>
          좋아요 <span className="ml-2 text-white">{likes}</span>
        </span>
      </button>

      <CommonModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        title="로그인이 필요합니다"
        message="좋아요 기능은 로그인한 사용자만 이용할 수 있어요."
        cancelText="닫기"
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setOpenLoginModal(false);
          navigate("/login");
        }}
      />

      <CommonModal
        open={openErrorModal}
        onClose={() => setOpenErrorModal(false)}
        title="오류 발생"
        message={errorMsg}
        cancelText="닫기"
      />
    </div>
  );
}
