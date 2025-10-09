// RecipeDetail.jsx
import { useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// 칵테일 도감 레시피 페이지
export default function RecipeDetail() {
  const { slug } = useParams();
  const [cocktail, setCocktail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:4000/api/cocktails/${slug}`
        );
        setCocktail(res.data);
      } catch (err) {
        setError("칵테일 레시피를 불러오는 도중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchCocktail();
  }, [slug]);

  if (loading) return <div className="text-white">불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (cocktail.length === 0)
    return <div className="text-white">레시피가 없습니다</div>;

  return (
    <article className="text-white max-w-4xl mx-auto flex gap-6 border-white/10 bg-white/5 rounded-4xl p-12 mt-12">
      <div className="flex-1 mr-12">
        <NavLink to="/recipe" className="text-sm text-white/70 hover:font-bold">
          ← 목록으로
        </NavLink>

        <h1 className="text-2xl font-bold mt-2 mb-4">{cocktail.name}</h1>
        <p className="text-white/70 mb-4">도수: ~{cocktail.abv}%</p>

        <section className="mb-6">
          <h2 className="text-xl mb-2">태그</h2>
          <ul className="flex gap-2 flex-wrap">
            {cocktail.tags.map((tag) => (
              <li
                key={tag}
                className="px-2 py-1 bg-white/10 rounded-full text-sm hover:scale-105 hover:cursor-pointer"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">재료</h2>
          <ul className="list-disc pl-6 space-y-1">
            {cocktail.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.name} — {ing.amount}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">만드는 법</h2>
          <ol className="list-decimal pl-6 space-y-1">
            {cocktail.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <div className="w-64 shrink-0">
        <img
          src={cocktail.image}
          alt={cocktail.name}
          className="rounded-xl object-cover w-full h-auto"
        />
        <p className="text-center mt-4 text-gray-300 px-2 py-1 bg-white/10 rounded-xl text-sm">
          {cocktail.comment}
        </p>
      </div>
    </article>
  );
}
