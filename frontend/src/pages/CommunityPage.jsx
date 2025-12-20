import CommunityList from "@/components/Community/CommunityList";
import CommunityButton from "@/components/Community/CommunityButton";

export default function Community() {
  return (
    <div className="w-screen min-h-screen flex flex-col items-center mt-4">
      <ul className="w-full max-w-[1000px] text-white max-h-[80vh] border-white/10 rounded-lg px-2 md:px-0">
        {/* 글 작성 버튼 */}
        <CommunityButton />

        {/* 글 헤더 및 목록 */}
        <CommunityList />
      </ul>
    </div>
  );
}
