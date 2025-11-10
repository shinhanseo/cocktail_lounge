// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// 백엔드 기본 URL
const API_BASE_URL = "http://localhost:4000/api";

// 인증 상태 관리 스토어
export const useAuthStore = create((set) => ({ // create -> 생성자 훅 생성, set -> 상태 변경에 사용
  user: JSON.parse(localStorage.getItem("user") || "null"), // localStorage에 user 여부에 따라 로그인 or 로그아웃 상태 유지

  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem("user", JSON.stringify(user)); // user가 있으면 localStorage에 "user"를 저장
    else localStorage.removeItem("user"); // 없을 시 로그아웃 상태 유지를 위해 "user" 삭제
  },

  logout: async () => { // 로그아웃 함수생성
    try {
      // 서버에도 로그아웃 알려주기 (쿠키 삭제용)
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        null,
        { withCredentials: true }
      ); // 백엔드 로그아웃 라우터 호출
    } catch (e) {
      console.error("logout error:", e);
    } finally {
      set({ user: null });
      localStorage.removeItem("user"); // 로그아웃 상태이기에 localStorage에 "user" 삭제
    }
  },

  async hydrateFromServer() { // 서버에서 현재 로그인 정보를 동기화해서, 프론트의 user 상태를 맞춰주기(App.js에서 시작하자마 한번실행)
    try {
      // 1차: 그냥 access 토큰으로 /me 호출
      const r = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
      });
      
      const user = r.data?.user || null;
      set({ user });

      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    } catch (err) {
      // 401이 아니면 그냥 로그아웃 상태로 처리
      const status = err?.response?.status;
      if (status !== 401) {
        set({ user: null });
        localStorage.removeItem("user");
        return;
      }

      // ========= 여기서 refresh 시도 =========
      try {
        // refresh 토큰으로 access 재발급 요청
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          null,
          { withCredentials: true }
        );

        // 재발급 성공했으면 /me 다시 호출
        const r2 = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
        });

        const user = r2.data?.user || null;
        set({ user });

        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
      } catch (e2) {
        // refresh도 실패하면 완전 로그아웃 상태로
        console.warn("hydrateFromServer refresh failed:", e2);
        set({ user: null });
        localStorage.removeItem("user");
      }
    }
  },
}));
