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

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (citys.length === 0)
    return <div className="text-white">추가된 도시가 없습니다</div>;

  return (
    <div className="grid md:grid-cols-3 gap-6 my-4 text-white">
      {citys.map((c) => (
        <NavLink
          key={c.id}
          to={`/bars/${c.city}`}
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden text-center hover:scale-105 "
        >
          <img src={c.image} alt={c.city} className="w-full h-30 object-fill" />
          <p className="my-auto">{c.city}</p>
        </NavLink>
      ))}
    </div>
  );
}
