// src/App.jsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// 앱 컴포넌트
export default function App() {
  const hydrateFromServer = useAuthStore((s) => s.hydrateFromServer);

  useEffect(() => {
    hydrateFromServer(); // 서버에서 전달된 사용자 정보 로드
  }, [hydrateFromServer]);

  return (
    <div className="bg-bg flex flex-col min-h-screen">
      <Header /> {/* 헤더 컴포넌트 */}
      <Outlet /> {/* 하위 라우트 렌더링 */}
      <Footer /> {/* 푸터 컴포넌트 */}
    </div>
  );
}
