// frontend/src/components/Recipe/RecipeList.jsx (파일명 유지/대체)
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// 홈화면 레시피 미리보기
export default function RecipePreView() {
  const [cocktails, setCocktails] = useState([]);
  const [pick, setPick] = useState(null); // ✅ 랜덤으로 뽑힌 칵테일
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/cocktails");
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setCocktails(items);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ 목록이 로드된 뒤에만 랜덤 선택 (UUID 대응: 인덱스로 뽑기)
  useEffect(() => {
    if (cocktails.length > 0) {
      const idx = Math.floor(Math.random() * cocktails.length);
      setPick(cocktails[idx] ?? null);
    } else {
      setPick(null);
    }
  }, [cocktails]);

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!pick) return <div className="text-white">레시피가 없습니다</div>;

  // ✅ 안전 가드 + 기본값
  const slug = pick.slug ?? pick.id; // 백엔드가 slug 없을 때 id로 대체해주지만 혹시 몰라서
  const imgSrc = pick.image || "/static/cocktails/default.jpg";
  const name = pick.name || "이름 없는 칵테일";
  const comment = pick.comment || "";

  return (
    <section
      className="rounded-2xl border border-white/10 p-5 text-white bg-white/5 
             shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] 
             transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">🍸 오늘의 추천 한잔</h2>
        <NavLink
          to="/recipe"
          className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
        >
          더보기 →
        </NavLink>
      </div>

      <div className="flex gap-6 justify-center mt-6">
        <div className="bg-white/10 rounded-2xl p-4 w-[200px] hover:scale-105 transition-all cursor-pointer">
          {/* ✅ slug/id 보장되는 경우에만 링크 */}
          {slug ? (
            <NavLink
              key={slug}
              to={`/cocktails/${encodeURIComponent(slug)}`}
              state={{ cocktails: pick }}
            >
              <img
                src={imgSrc}
                alt={name}
                className="rounded-xl object-fill h-36 w-full"
                loading="lazy"
              />
            </NavLink>
          ) : (
            <img
              src={imgSrc}
              alt={name}
              className="rounded-xl object-fill h-36 w-full"
              loading="lazy"
            />
          )}

          <h3 className="text-m font-semibold mt-2">{name}</h3>
          {comment && <p className="text-sm text-white/70">{comment}</p>}
        </div>
      </div>
    </section>
  );
}
