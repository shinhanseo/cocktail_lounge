// 커뮤니티 게시판 상단 글쓰기 버튼튼
import postButton from "../../assets/post.jpg";
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
        className="text-white ml-5 p-2 bg-white/95 rounded-full hover:scale-110 hover:cursor-pointer"
      >
        <img src={postButton} alt="글쓰기 버튼" className="w-6 h-6" />
      </button>
    </div>
  );
}
