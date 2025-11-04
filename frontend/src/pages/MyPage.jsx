import { Outlet } from "react-router-dom";
import MyPageHeader from "@/components/MyPage/MyPageHeader";

export default function MyPage() {
  return (
    <div className="min-h-[500px] flex justify-center py-12">
      <div className="flex gap-10 w-full max-w-5xl">
        {/* 왼쪽 메뉴 */}
        <MyPageHeader />

        {/* 오른쪽 영역*/}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
