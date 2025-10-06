import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RamdomBarList() {
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:4000/api/bars`);
        setBars(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        } else {
          setError("Bar를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBar();
  }, []);

  const popularBars = bars.slice(0, 3);

  if (loading) return <div className="text-white p-8">불러오는 중...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;
  if (!bars)
    return <div className="text-white p-8">정보를 찾을 수 없습니다.</div>;
  return (
    <>
      {popularBars.map((bar) => (
        <NavLink
          key={bar.id}
          to={`/bars/${bar.city}`}
          className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
        >
          <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{bar.name}</div>
            <div className="text-xs text-gray-400 truncate">
              {bar.city} • {bar.desc}
            </div>
          </div>
          <div className="text-xs text-teal-400">📍</div>
        </NavLink>
      ))}
    </>
  );
}
