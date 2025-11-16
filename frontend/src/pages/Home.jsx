import CommunityPreview from "@/components/Preview/CommunityPreview";
import RecipePreview from "@/components/Preview/RecipePreview";
import MapPreview from "@/components/Preview/MapPreview";
import AIBartenderPreview from "@/components/Preview/AIBartenderPreview";
// 첫 홈 화면
export default function Home() {
  return (
    <main className="px-auto mt-12 text-white max-w-6xl mx-auto w-[900px]">
      <div className="grid md:grid-rows-2 md:grid-cols-2 gap-6">
        {/* 2사분면: 컨텐츠 예정 */}
        <AIBartenderPreview />

        {/* 1사분면: 오늘의 한잔 추천 */}
        <RecipePreview />

        {/* 3사분면: 칵테일 여지도 */}
        <MapPreview />

        {/* 4사분면: 커뮤니티 요약 */}
        <CommunityPreview />
      </div>
    </main>
  );
}
