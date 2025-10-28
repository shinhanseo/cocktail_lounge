// src/App.jsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function App() {
  const hydrateFromServer = useAuthStore((s) => s.hydrateFromServer);

  useEffect(() => {
    hydrateFromServer();
  }, [hydrateFromServer]);

  return (
    <div className="bg-bg flex flex-col min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
