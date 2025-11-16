import { NavLink } from "react-router-dom";

export default function MyPageHeader() {
  const navClass = ({ isActive }) =>
    `text-left px-3 py-2 rounded-lg transition font-medium hover:cursor-pointer ${
      isActive ? "text-title bg-gray-800" : "text-white hover:bg-gray-800"
    }`;

  const headertitle = [
    { title: "내 정보", to: "/mypage", exact: true },
    { title: "내가 쓴 게시글", to: "/mypage/posts" },
    { title: "내가 쓴 댓글", to: "/mypage/comments" },
    { title: "좋아요 보낸 게시글", to: "/mypage/postlike" },
    { title: "좋아요 보낸 칵테일", to: "/mypage/cocktaillike" },
    { title: "바 북마크", to: "/mypage/mybars" },
    { title: "AI 바텐더", to: "/mypage/myaicocktails" },
  ];

  return (
    <div className="w-60 border border-white/10 bg-white/5 rounded-2xl p-8 text-white shadow-md">
      <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-3">
        마이페이지
      </h2>

      <div className="flex flex-col space-y-3">
        {headertitle.map((h, i) => (
          <NavLink key={i} to={h.to} end={h.exact} className={navClass}>
            {h.title}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
