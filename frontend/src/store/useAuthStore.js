// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// 인증 상태 관리 스토어
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setUser: (user) => {
    set({ user }); // 사용자 정보 설정
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user"); // 사용자 정보 제거
  },

  logout: () => {
    set({ user: null }); // 사용자 정보 제거  
    localStorage.removeItem("user"); // 사용자 정보 제거
  },

  async hydrateFromServer() {
    try {
      const r = await axios.get("http://localhost:4000/api/me");
      set({ user: r.data?.user || null }); // 사용자 정보 설정  
      if (r.data?.user) localStorage.setItem("user", JSON.stringify(r.data.user)); // 사용자 정보 저장      
      else localStorage.removeItem("user"); // 사용자 정보 제거
    } catch {
      set({ user: null }); // 사용자 정보 제거
      localStorage.removeItem("user"); // 사용자 정보 제거  
    }
  },
}));
