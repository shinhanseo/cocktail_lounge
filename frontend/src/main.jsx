import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route element={<Main />}>
            {/* 기본 페이지들 */}
            <Route index element={<Home />} />
            <Route path="community" element={<Community />} />
            <Route path="posts/:id" element={<CommunityDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="today" element={<Today />} />
            <Route path="map" element={<Map />} />
            <Route path="recipe" element={<Recipe />} />
            <Route path="cocktails/:id" element={<RecipeDetail />} />
            <Route path="bars/:city" element={<BarDetail />} />
            <Route path="communitywriting" element={<CommunityWriting />} />
            <Route path="communityedit/:id" element={<CommunityEdit />} />
            <Route path="search" element={<SearchResult />} />

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
