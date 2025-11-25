// 커뮤니티 게시판 상단 글쓰기 버튼튼
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import CommonModal from "../CommonModal";
import { useState } from "react";

export default function CommunityButton() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const [openLoginModal, setOpenLoginModal] = useState(false);

  const onClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/communitywriting");
    } else {
      setOpenLoginModal(true);
    }
  };

  return (
    <div className="text-right mr-8">
      <button
        onClick={onClick}
        className="
          ml-5 p-3 
          bg-white/10 
          border border-white/20 
          backdrop-blur-sm
          rounded-full 
          shadow-md 
          transition-all 
          hover:cursor-pointer
          hover:bg-white/20 
          hover:scale-110 
          hover:shadow-white/40 
          active:scale-95
          "
      >
        <Pencil className="w-5 h-5 text-white" strokeWidth={2} />
      </button>
      <CommonModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        title="로그인이 필요합니다"
        message="이 기능은 로그인한 사용자만 이용할 수 있어요."
        cancelText="닫기"
        confirmText="로그인 하러가기"
        onConfirm={() => {
          setOpenLoginModal(false);
          navigate("/login");
        }}
      />
    </div>
  );
}
