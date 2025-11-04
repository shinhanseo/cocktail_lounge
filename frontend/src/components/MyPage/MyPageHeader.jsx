import { useNavigate } from "react-router-dom";

export default function MyPageHeader() {
  const navigate = useNavigate();

  const headertitle = [
    { title: "내 정보", to: "/mypage" },
    { title: "내가 쓴 게시글", to: "/mypage/posts" },
    { title: "내가 쓴 댓글", to: "/mypage/comments" },
    { title: "내가 보낸 좋아요", to: "/mypage/likes" },
  ];

  return (
    <div className="w-60 border border-white/10 bg-white/5 rounded-2xl p-8 text-white shadow-md">
      <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-3">
        마이페이지
      </h2>

      <div className="flex flex-col space-y-3">
        {headertitle.map((h, i) => (
          <button
            key={i}
            onClick={() => navigate(h.to)}
            className="text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition font-medium hover:cursor-pointer"
          >
            {h.title}
          </button>
        ))}
      </div>
    </div>
  );
}
