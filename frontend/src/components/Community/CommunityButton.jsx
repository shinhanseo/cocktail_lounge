// 커뮤니티 게시판 상단 글쓰기 버튼튼
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function CommunityButton() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const onClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/communitywriting");
    } else {
      alert("로그인 상태여야 가능합니다.");
      navigate("/login");
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
    </div>
  );
}
