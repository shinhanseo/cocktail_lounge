export default function CommunityHeader() {
  return (
    <li
      className="grid grid-cols-[80px_1fr_140px_120px] sm:grid-cols-[80px_1fr_140px_120px]
                 font-bold text-2xl border-white/10 border-b-4 p-2 text-center
                 sticky top-0 bg-header"
    >
      <div className="text-center">No.</div>
      <div className="text-left pl-2">제목</div>
      <div className="text-center">작성자</div>
      <div className="text-center">작성일</div>
    </li>
  );
}
