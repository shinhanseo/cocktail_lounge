import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// 홈화면 레시피 미리보기
// 램덤 숫자 리턴
function getRandomId(min = 1, max) {
  if (typeof max !== "number") throw new Error("max가 필요합니다");
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RecipePreView() {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:4000/api/cocktails");
        setCocktails(Array.isArray(res.data?.items) ? res.data.items : []);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        } else {
          setError("칵테일을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCocktail();
  }, []);

  const cocktailId = getRandomId(1, cocktails.length); // 램덤으로 숫자 지정

  const cocktail = cocktails.find((c) => c.id === cocktailId); // id로 칵테일 찾기

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (cocktails.length === 0)
    return <div className="text-white">레시피가 없습니다</div>;
  return (
    <section className="rounded-2xl border border-white/10 p-5 text-white bg-white/5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">오늘의 추천 한잔</h2>
        <NavLink
          to="/recipe"
          className="text-sm underline underline-offset-4 decoration-2 decoration-underline hover:font-bold"
        >
          더보기 →
        </NavLink>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 text-center w-[200px] mx-auto mt-4 hover:scale-105">
        <NavLink
          key={cocktail.slug}
          to={`/cocktails/${cocktail.slug}`}
          state={{ cocktails: cocktail }}
        >
          <img
            src={cocktail.image}
            alt={cocktail.name}
            className="w-full h-40 object-cover rounded-t-2xl"
          />
          <p className="my-auto">{cocktail.name}</p>
        </NavLink>
      </div>
    </section>
  );
}
