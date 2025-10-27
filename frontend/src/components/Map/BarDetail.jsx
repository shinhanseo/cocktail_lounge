import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import MapCard from "@/components/Map/MapCard";

export default function BarDetail() {
  const { city } = useParams();

  const [bars, setBars] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedBar(null);
  }, [city]);

  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:4000/api/bars`);
        setBars(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (!(err.name === "CanceledError" || err.code === "ERR_CANCELED")) {
          setError("Bar를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBar();
  }, []);

  const handleBarSelect = (bar) => setSelectedBar(bar);
  const filteredBars = city ? bars.filter((b) => b.city === city) : [];

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!bars || bars.length === 0) {
    return (
      <div className="w-full mt-12 text-white">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold">{city}</h2>
        </div>
        <div className="mb-4">
          <NavLink to="/map" className="text-sm text-white/70 hover:font-bold">
            ← 목록으로
          </NavLink>
        </div>
        <div className="text-center text-gray-400 py-10">
          선택한 지역의 Bar 정보가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-12">
      {/* 제목 */}
      <div className="w-full text-white text-center mb-6">
        <h2 className="text-3xl font-bold">{city}</h2>
      </div>

      <div className="mb-4">
        <NavLink to="/map" className="text-sm text-white/70 hover:font-bold">
          ← 목록으로
        </NavLink>
      </div>

      <div className="flex gap-6 items-start">
        {/* 왼쪽: 지도 */}
        <div className="flex-1">
          <MapCard
            height={500}
            width="100%"
            selectedBar={selectedBar}
            centerKey={city}
            bars={filteredBars}
          />
        </div>

        {/* 오른쪽: 리스트 */}
        <aside className="w-[600px] shrink-0 text-white">
          <ul className="mr-12 h-[500px] overflow-y-auto overflow-x-hidden">
            <li className="grid grid-cols-[200px_1fr] font-bold text-2xl border-white/10 border-b-4 pb-2 mb-2 text-center sticky top-0 backdrop-blur">
              <div className="mt-2">매장명</div>
              <div className="mt-2">위치</div>
            </li>

            {filteredBars.map((b) => {
              const isActive = selectedBar && selectedBar.id === b.id;
              return (
                <li
                  key={b.id}
                  className="grid grid-cols-[200px_1fr] border-white/10 border-b-4 py-2 px-2 transition"
                >
                  <button
                    type="button"
                    className="text-center cursor-pointer transition-colors font-medium"
                    onClick={() => handleBarSelect(b)}
                  >
                    {b.name}
                    {isActive && "📍 "}
                  </button>
                  <div className="text-center">{b.address}</div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
