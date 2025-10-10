// src/pages/BarCity.jsx
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BarCity() {
  const [citys, setCitys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCity = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/citys");
        setCitys(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("도시를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCity();
  }, []);

  if (loading)
    return <div className="text-white text-center py-12">불러오는 중...</div>;
  if (error)
    return <div className="text-red-400 text-center py-12">{error}</div>;
  if (citys.length === 0)
    return (
      <div className="text-white text-center py-12">추가된 도시가 없습니다</div>
    );

  return (
    <div className="mt-8">
      {/* 상단 문구 추가 */}
      <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-6">
        내 주변의 Bar를 찾아보세요! 🍹
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
        {citys.map((c) => (
          <NavLink
            key={c.id}
            to={`/bars/${c.city}`}
            className="group relative rounded-xl border border-white/10 bg-white/5 
                     overflow-hidden text-center shadow-[0_2px_8px_rgba(0,0,0,0.25)]
                     transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="overflow-hidden">
              <img
                src={c.image}
                alt={c.city}
                className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 py-2
                       bg-gradient-to-t from-black/70 via-black/30 to-transparent
                       text-white text-base font-semibold tracking-wide"
            >
              {c.city}
            </div>

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100
                       bg-black/40 flex items-center justify-center transition-opacity duration-300"
            >
              <p className="text-white font-bold text-sm bg-white/10 rounded-xl px-3 py-1">
                보기 →
              </p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
