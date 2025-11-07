import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Like({ postId }) {
  const user = useAuthStore((s) => s.user);
  const isLogined = !!user;
  const [liked, setLiked] = useState(false); // 좋아요 눌렀는지 여부
  const [likes, setLikes] = useState(0); // 좋아요 총 개수
  const navigate = useNavigate();

  // 초기 상태 불러오기 (카운트 + 내가 눌렀는지)
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/posts/${postId}/like`,
          {
            withCredentials: true,
          }
        );
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
        await axios.delete(`http://localhost:4000/api/posts/${postId}/like`, {
          withCredentials: true,
        });
        setLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        // 안 눌렀으면 → 좋아요
        await axios.post(
          `http://localhost:4000/api/posts/${postId}/like`,
          null,
          {
            withCredentials: true,
          }
        );
        setLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (err) {
      if (!isLogined) {
        alert("로그인을 하셔야 해당 기능을 이용할 수 있습니다.");
        navigate("/login");
        return;
      }
      console.log(err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
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
    </div>
  );
}
