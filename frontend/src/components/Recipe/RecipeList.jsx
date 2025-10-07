// frontend/src/components/Recipe/RecipeList.jsx
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RecipeList() {
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

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (cocktails.length === 0)
    return <div className="text-white">레시피가 없습니다</div>;

  return (
    <div className="grid md:grid-cols-4 gap-6 my-4 text-white w-[800px]">
      {cocktails.map((c) => (
        <NavLink
          key={c.slug}
          to={`/cocktails/${c.slug}`}
          state={{ cocktails: c }}
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden text-center hover:scale-105 transition-transform"
        >
          <img
            src={c.image}
            alt={c.name}
            className="w-full h-[160px] object-cover"
          />
          <p className="py-auto">{c.name}</p>
        </NavLink>
      ))}
    </div>
  );
}
