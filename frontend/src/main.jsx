import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

import "@/index.css";
import App from "@/App";
import Main from "@/components/Main";
import Home from "@/pages/Home";
import Community from "@/pages/CommunityPage";
import CommunityDetail from "@/components/Community/CommunityDetail";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Today from "@/pages/Today";
import Recipe from "@/pages/Recipe";
import RecipeDetail from "@/components/Recipe/RecipeDetail";
import Map from "@/pages/Map";
import BarDetail from "@/components/Map/BarDetail";
import CommunityWriting from "@/components/Community/CommunityWriting";
import CommunityEdit from "@/components/Community/CommunityEdit";
import MyPage from "@/pages/MyPage";
import InfoMe from "@/components/MyPage/InfoMe";
import MyPosts from "@/components/MyPage/MyPosts";
import MyComments from "@/components/MyPage/MyComments";
import PostLike from "@/components/MyPage/PostLike";
import CocktailLike from "@/components/MyPage/CocktailLike";
import SearchResult from "@/pages/SearchResult";
import MyBars from "@/components/MyPage/MyBars";
import MyAiCocktails from "@/components/MyPage/AiCocktails";
import AiCocktailsRecipe from "@/components/Recipe/AiCocktailsRecipe";

console.log("VITE_SENTRY_DSN =", import.meta.env.VITE_SENTRY_DSN);
console.log("VITE_APP_RELEASE =", import.meta.env.VITE_APP_RELEASE);
// Sentry는 앱 생명주기에서 가능한 한 빨리 초기화
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // production / development
  release: import.meta.env.VITE_APP_RELEASE, // vercel commit sha 등으로 주입

  // 운영 서비스에서는 개인정보(PII) 수집을 보수적으로
  sendDefaultPii: false,

  // 성능(트레이싱)까지 보고 싶으면 켜기
  integrations: [Sentry.browserTracingIntegration()],

  // 운영에서 1.0(100%)는 비용/노이즈 커질 수 있음
  tracesSampleRate: 0.1,

  // 원하면 여기서 민감정보 제거/가공 가능
  beforeSend(event) {
    // 예: event.request?.headers에서 Authorization/Cookie 제거 등
    return event;
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route element={<Main />}>
            {/* 기본 페이지들 */}
            <Route index element={<Home />} />
            <Route path="community" element={<Community />} />
            <Route path="community/:id" element={<CommunityDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="today" element={<Today />} />
            <Route path="bars" element={<Map />} />
            <Route path="cocktails" element={<Recipe />} />
            <Route path="cocktails/:id" element={<RecipeDetail />} />
            <Route path="bars/:city" element={<BarDetail />} />
            <Route path="communitywriting" element={<CommunityWriting />} />
            <Route path="communityedit/:id" element={<CommunityEdit />} />
            <Route path="search" element={<SearchResult />} />
            <Route path="aicocktails/:id" element={<AiCocktailsRecipe />} />

            {/* 마이페이지 (중첩 라우팅) */}
            <Route path="mypage" element={<MyPage />}>
              <Route index element={<InfoMe />} />
              <Route path="posts" element={<MyPosts />} />
              <Route path="comments" element={<MyComments />} />
              <Route path="postlike" element={<PostLike />} />
              <Route path="cocktaillike" element={<CocktailLike />} />
              <Route path="mybars" element={<MyBars />} />
              <Route path="myaicocktails" element={<MyAiCocktails />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
