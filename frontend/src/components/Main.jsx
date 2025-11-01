// react-router-dom에서 Outlet 컴포넌트를 가져옴
// Outlet은 라우트의 중첩 컴포넌트(자식 라우트)가 렌더링될 위치를 의미
import { Outlet } from "react-router-dom";

// 메인 레이아웃 컴포넌트
// 모든 페이지의 공통 레이아웃에서 자식 라우트들을 표시하는 역할
export default function Main() {
  return (
    // flexbox를 이용해 자식 컴포넌트를 화면 중앙에 정렬
    <main className="flex items-center justify-center flex-1">
      {/* 중첩된 라우트가 여기에 렌더링됨 */}
      <Outlet />
    </main>
  );
}
