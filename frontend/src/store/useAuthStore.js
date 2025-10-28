// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem("user");
  },

  async hydrateFromServer() {
    try {
      const r = await axios.get("http://localhost:4000/api/me");
      set({ user: r.data?.user || null });
      if (r.data?.user) localStorage.setItem("user", JSON.stringify(r.data.user));
      else localStorage.removeItem("user");
    } catch {
      set({ user: null });
      localStorage.removeItem("user");
    }
  },
}));
