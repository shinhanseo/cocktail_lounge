// main.jsx
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

// 루트 엘리먼트 렌더링
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route element={<Main />}>
            <Route index element={<Home />} />
            <Route path="community" element={<Community />} />
            <Route path="posts/:id" element={<CommunityDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="today" element={<Today />} />
            <Route path="map" element={<Map />} />
            <Route path="recipe" element={<Recipe />} />
            <Route path="cocktails/:slug" element={<RecipeDetail />} />
            <Route path="bars/:city" element={<BarDetail />} />
            <Route path="communitywriting" element={<CommunityWriting />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
