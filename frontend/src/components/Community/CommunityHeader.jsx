// 커뮤니티 게시판 Header 부분분
export default function CommunityHeader() {
  return (
    <li
      className="grid grid-cols-[70px_1fr_140px_120px_60px]
                 font-semibold text-sm sm:text-base text-white/80
                 border-b border-white/10 px-6 py-3 text-center
                 sticky top-0 bg-white/10 backdrop-blur-[4px]
                 shadow-[0_2px_8px_rgba(0,0,0,0.25)] z-10"
    >
      <div className="text-center">No.</div>
      <div className="text-left pl-2">제목</div>
      <div className="text-center">작성자</div>
      <div className="text-center">작성일</div>
      <div className="text-center">댓글</div>
    </li>
  );
}
