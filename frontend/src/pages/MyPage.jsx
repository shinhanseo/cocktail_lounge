import { Outlet, useLocation } from "react-router-dom";
import MyPageHeader from "@/components/MyPage/MyPageHeader";

export default function MyPage() {
  const { pathname } = useLocation();

  // 현재 페이지가 "내 게시글"일 때만 스크롤 허용
  const isPostPage = pathname.includes("/mypage/posts");

  return (
    <div className="min-h-[500px] flex justify-center py-12">
      <div className="flex gap-10 w-full max-w-5xl">
        {/* 왼쪽 메뉴 */}
        <div className="flex-shrink-0">
          <MyPageHeader />
        </div>

        {/* 오른쪽 내용 */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
